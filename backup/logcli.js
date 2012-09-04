var net = require('net');

module.exports = function(procid,address,port){
    this.procid = procid;
    this.address = address;
    this.port = port;
    this.running = 0; // 0=idle, 1=connecting, 2=connected;
    this.sock;

    this.local = ((port == void 0) ? true:false);


    this.setup = function(){
	console.log('logcli : connect to ', address);

	if (this.local){
	    this.sock = net.connect({path:this.address});
	}else{
	    this.sock = net.connect({port:this.port, host:this.address});
	}

	this.sock.on('connect', function(){
		console.log('logcli : have connect to server');
		this.running = 2;
		});

	this.sock.on('error', function(e){
		console.log('logcli : got error : ', e);
		this.running = 0;
		});

	this.running = 1;
    };

    this.log = function(message) {
	
	console.log('logcli : log message => ', message);

	if(this.running != 2){
	    console.log('logcli : sock ' + message);
	    this.sock.write(procid + ' : ' + message);
	}else{
	    console.log('logcli : ' + message);
	}
    };

    this.close = function(){
	this.running = 0;
	this.sock.close();
    };
}


