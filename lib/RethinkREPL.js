'use strict';
const r = require('rethinkdb');
const Readline = require('readline');
const vm = require('vm');

class RethinkREPL{

  constructor(username, password, host, port, database){
    this.username = username;
    this.password = password;
    this.host = host || 'localhost';
    this.port = port || 28015;
    this.database = database || 'test';

    this.lineBuffer = '';
  }

  start(){
    let connectOpt = {
      'host': this.host, 
      'port': this.port, 
      'db': this.database,
      'user': this.username,
      'password': this.password
    };

    //console.log(connectOpt);

    this.connPromise = r.connect(connectOpt).error((err,conn) => {
      console.error(err.msg);
      process.exit(1);
    });

    this.connPromise.then((conn) => {
      this.rl = Readline.createInterface({
  
        input: process.stdin,
        output: process.stdout
  
      });
      
      this.promptLine();   
      this.rl.on('SIGINT', this.quit.bind(this));
      this.rl.on('line', this.executeCommand.bind(this));

    });
  }

  promptLine(){
    //this.rl.setPrompt('rethinkdb ' + this.host + ':' + this.port + '> ');
    this.rl.setPrompt('rethinkdb [' + this.database + ']> ');
    this.rl.prompt(true);
  }
  
  quit() {
    this.rl.close();
    this.connPromise.then((conn) => {conn.close()});
    process.exit(0);
  }

  executeCommand (line) {
    this.lineBuffer += line;

    if(this.lineBuffer.lastIndexOf('\\') == this.lineBuffer.length -1){
      this.lineBuffer = this.lineBuffer.substring(0,this.lineBuffer.length -1) + '\n';
      return;
    }

    
    if(!this.lineBuffer || this.lineBuffer.trim().length == 0){
      this.promptLine();
      return;
    }

    if(this.lineBuffer.trim() == 'quit' || this.lineBuffer.trim() == 'exit'){
      this.quit();
      return;
    }

    if(this.lineBuffer.indexOf('.run') >= 0) {
      console.log('Run does not need.');
      this.promptLine();
    }

    else if(this.lineBuffer.trim().indexOf('r.') !== 0 && this.lineBuffer.trim().indexOf('use ') !== 0){
      console.log('Command not support: ' + this.lineBuffer );
      this.promptLine();
    }

    else if(this.lineBuffer.indexOf('r.connect()') >= 0 || this.lineBuffer.indexOf('r.reconnect()') >= 0) {
      console.log('Command not support: ' + this.lineBuffer);
      this.promptLine();
    }
    else if (this.lineBuffer.trim().indexOf(';') == this.lineBuffer.trim().length -1){
      console.log('Invalid character ";"');
      this.promptLine();
    }

    else {

      if(this.lineBuffer.trim().indexOf('use ') == 0){
        let db = this.lineBuffer.trim().split(' ')[1];
        this.lineBuffer = '';

        this.connPromise.then((conn)=>{
          // let sandbox = {conn: conn, result: null};
          // let script = new vm.Script('conn.use("'+db+'");');
          // let context = new vm.createContext(sandbox);
          // script.runInContext(context);
          conn.use(db);
          this.database = db;
          this.promptLine();
        });

      } else if (this.lineBuffer.trim().indexOf('r.') == 0){
 
        this.connPromise.then((conn) => {
          let sandbox = {r: r, conn: conn, result: null};
          let script = new vm.Script('result = ' + this.lineBuffer+ '.run(conn);');
          let context = new vm.createContext(sandbox);
          this.lineBuffer ='';

          try {
            script.runInContext(context);
            sandbox.result.then((cursor) => {
              
              cursor.toArray().then((item) => {
                console.log(item);
                this.promptLine();             
              }).error((error)=>{
                console.log(error.msg);
                this.promptLine();
              });
  
            }).error((error)=> {
              console.log(error.msg);
              this.promptLine();
            });
          } catch (error) {

            console.error(error);
            this.promptLine();
          }
        });

      }
        
    }

  } 

}


module.exports = RethinkREPL;
