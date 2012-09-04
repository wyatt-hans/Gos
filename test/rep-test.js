//
// copyright @ 2012/08/18, All rights reserved.
// writed by konghan
//

var msgrpc  = require('msgpack-rpc');
var mongo   = require('mongodb');

var REP_MGMT_RPC_PORTAL = {
	'host' : '127.0.0.1',
	'port' : '2010'
};

var REP_RPC_PORTAL = {
	'host' : '127.0.0.1',
	'port' : '2012'
};


var logger = console;

var mgmt = msgrpc.createClient(2010, '127.0.0.1');

function repTestRpc(rpcsvr){
	var rpc = msgrpc.createClient(rpcsvr.port, rpcsvr.host);
	
	rpc.on('ready', function(){
		rpc.invoke('getCred', {name:'konghan'}, function(err, rsp){
			logger.log('get cred return : ', err);
			
			if(!err){
				logger.log('name : konghan => ', rsp);
			}
		});
		
		rpc.invoke('getUser', {uid:1}, function(err, rsp){
			logger.log('get user return : ', err);
			
			if(!err){
				logger.log('uid : 1 => ', rsp);
			}
		});		
	};
}

mgmt.on('ready', fucntion(){
	
	var mgodb = {host:'127.0.0.1', port:'2010', db:'gos'};
	
	mgmt.invoke('setupMngo', mgodb, function(err, rsp){
		
		logger.log('setup mongodb return : ', err);
		
		if(!err) {
			var rpcsvr = {host:'127.0.0.1', port:'2012'};
			mgmt.invoke('setupRepos', rpcsvr, function(err, rsp){
				logger.log('setup repos return : ', err);
				
				if(!err){
					repTestRpc(rpcsvr);
				}
			});
		}
	});
});

