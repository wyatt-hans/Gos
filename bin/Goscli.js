/*
 * Gos client
 */

var util     = require('util');
var net      = require('net');
var readline = require('readline');
var msgpack  = require('msgpack');

function msgProc(m, cli){
}

function cli(host, port, name, passwd){
	this.host = host;
	this.port = port;
	this.user = user;
	this.passwd = passwd;
	this.status = 0;
	
	this.actions;
	this.location;
	
	this.setup = function(){
		this.sock = net.connect(port, host, function(){
			this.msg = msgpack.Stream(this.sock);
			this.msg.on('msg', function(m){
				msgProc(m, this);
			});
		
			var user = {name:name, passwd:passwd};
			this.msg.send(user);
		});
	};
}

var rl = readline.createInterface({input: process.stdin,
  			output: process.stdout});
  			
var uc = new cli('127.0.0.1', 6868, 'konghan', 'konghan);
uc.setup();

while(1){
	actstr =
	rl.question(actstr, function(act){
	});
}



