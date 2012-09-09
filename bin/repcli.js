//
// copyright @ 2012/09/06, All rights reserved.
// writed by konghan
//

/*
 * repcli -c setup -t self [-h host] [-p port]
 * repcli -c close -t self [-h host] [-p port]
 * 
 * repcli -c setup -t mdb [-h host] [-p port]
 * repcli -c close -t mdb [-h host] [-p port]
 * repcli -c status -t mdb [-h host] [-p port]
 *
 * repcli -c setup -t rep [-h host] [-p port]
 * repcli -c close -t rep [-h host] [-p port]
 * repcli -c status -t rep [-h host] [-p port]
 *
 * repcli -c authen --name name --passwd passwd
 *
 */


var msgrpc  = require('msgpack-rpc');
var nopt = require("nopt")
var util   = require('util');

var knownOpts = { 	"cmd" : [String, null],
                	"type" : [String, null],
                	"host" : [String, null],
                	"port" : [Number, null],
                	"user" : [String, null],
                	"passwd" : [String, null],
                };

var opts = nopt(knownOpts, {}, process.argv, 2);

if(opts.cmd == void 0){
	console.log(util.inspect(opts, true));
	process.exit(-1);
}

if((opts.cmd != 'authen')&&(opts.type == void 0)){
	console.log(util.inspect(opts, true));
	process.exit(-1);
}

//console.log(opts);

var svc;
var repHost = '127.0.0.1';
var repPort = 2020;

if(opts.type == 'self'){
	if(opts.cmd == 'close'){
		svc.deleteService();
//		process.exit(0);
	}else{
		var svcf = require('../src/service.js');
		svc = svcf.createService('../src/repos.js', opts.host, opts.port);
		repHost = opts.host;
		repPort = opts.port;
		console.log('create repos service ');
		process.exit(0);
	}
}else{
	var rpc;
	var h = repHost;
	var p = repPort;
	
	if((opts.cmd != 'setup')&&(opts.cmd != 'close')&&(opts.cmd != 'status')){
		h = opts.host;
		p = opts.port;
	}
	console.log('rpc connecte to ' + h + ' ' + p);
	var rpc = msgrpc.createClient(p, h, function(){
	console.log('rpc connected,will call '+opts.cmd + ' to '+opts.type);
			
		switch(opts.cmd){
		case 'setup':
			switch(opts.type){
			case 'mdb':
				rpc.invoke('setupDbc', {host:opts.host, port:opts.port, name:'Gos'},
					function(err,rsp){
						console.log('rpc all return:'+ err + '|' + rsp);
						process.exit(err);
					});
				break;
			case 'rep':
				rpc.invoke('setupRep', {host:opts.host, port:opts.port},
					function(err,rsp){
						process.exit(err);
					});
				break;
			};
			break;
		case 'close':
			switch(opts.type){
			case 'mdb':
				rpc.invoke('closeDbc', function(err,rsp){
						process.exit(err);
				});
				break;
			case 'rep':
				rpc.invoke('closeRep', function(err,rsp){
					process.exit(err);
				});
				break;
			};
			break;
		
		case 'status':
			switch(opts.type){
			case 'mdb':
				rpc.invoke('getDbcStat', function(err,rsp){
					process.exit(err);
				});
				break;
			case 'rep':
				rpc.invoke('getRepStat', function(err,rsp){
					process.exit(err);
				});
			break;
			};
			break;
			
		case 'authen':
			rpc.invoke('authen', {name:opts.user, passwd:opts.passwd}, function(err,rsp){
				console.log('authen : ', err);
				process.exit(err);
			});
			break;
		}
	});
	
//	console.log(util.inspect(rpc));
}




