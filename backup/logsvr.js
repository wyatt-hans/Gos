
var net = require('net');

function logsvr(logfile, address, port){
    this.logfile = logfile;
    this.address = address;
    this.port = port;
    this.local = port == void 0 ? true : false;
    this.logsvr = net.createServer();

    this.logsvr.on('connection', function(sock){
	    console.log('logsvr : a client have connected in');
	//    sock.setencoding('ascii');

	    sock.on('data', function(buffer){
		console.log('logsvr : ', buffer.toString());
		});
	    });

    this.logsvr.on('error', function(e){
	    console.log('logsvr : ', e);
	    });

    this.logsvr.on('listening', function(){
	    console.log('logsvr : listening');
	    });

    this.setup_log = function(){

	console.log('logsvr : listen on ', address);

	if(this.local){
	    console.log('setup local logsvr:', address);
	    this.logsvr.listen(address);
	}else{
	    console.log('setup socket logsvr:', address);
	    this.logsvr.listen(port, address);
	}
    };

    this.setup_mnt = function(){
    };

    this.setup = function(){
	this.setup_mnt();
	this.setup_log();
    };
};


var logs;

process.on('message', function(m){

	console.log('logsvr : ', m.message);

	if (m.message == 'config'){
	    console.log('logsvr : config -> ', m.config);

	    logs = new logsvr(m.config.logfile, 
		m.config.address, m.config.port);
	    logs.setup();

	    process.send({message:'run'});
	}
});


