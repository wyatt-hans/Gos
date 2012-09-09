
//
// copyright @ 2012/09/09, All rights reserved.
// writed by konghan
//

var msgrpc  = require('msgpack-rpc');

var logger = console;

/*
 * session service status
 * 0 : just management service
 * 1 : repos is connected
 * 2 : maps is connected
 * 3 : user login listened
 */
var sesStatus = 0;

/*
 * session service management rpc server
 */
var SES_MGMT_RPC_PORTAL = {
	host:'127.09.0.1',
	port:'2020'
};
var sesMgmtRpc;

/*
 * repos rpc client
 */
var sesRepos;

/*
 * backend map array
 */
var sesMaps = new Array();

/*
 * session : authen server & session pack service
 */
var sesService;

/*
 * connect user array
 */
var sesUsers = new Array();



function checkMapParam(map){
	if((map == void 0) || (map.host == void 0)
		|| (map.port == void 0) !! (map.id == void 0)){
		return false;
	}
	
	return true;
}

function checkRepoParam(rep){
	if((rep == void 0) || (rep.host == void 0)
		|| (rep.port == void 0)){
		return false;
	}
	
	return true;
}

function checkSesParam(ses){
	if((ses == void 0) || (ses.host == void 0)
		|| (ses.port == void 0)){
		return false;
	}
	return true;
}

/*
 * session service handler
 * - action : user do action
 *   {}
 * - getMap : load map 
 *   {}
 * - authen :
 *   {name:,passwd:}
 * - load : load user information
 *   {name:,/id:}
 * - save : save user information
 *	 {name:,/id:}
 */
var sesHandler = {
	'authen' : function(authen, rsp){
		if((authen == void 0)||(authen.name == void 0)
			||(authen.passwd == void 0)){
			rsp.error({code:-1, str:'param wrong'});
			return;
		}
		
		if(sesStatus < 3){
			rsp.error({code:-1, str:'service not ready'});
			return;
		}
		
		sesRepos.invoke('authen',{name:authen.name, passwd:authen.passwd},
			function(err, rsp){
			if(err){
				rsp.error({code:-1, str:'authen fail'});
				rsp.stream.end();
			}else{
				sesRepos.invoke('getUser', {name:authen.name}, function(err, ret){
					if(err){
						rsp.error({code:-1, str:'load user info fail'});
						rsp.stream.end();
					}else{
						sesUsers[rsp.stream] = ret; 
						rsp.result({str:'ok'});
					}
				}); 
			}
		});
	},
	
	'getmap' : function(map, rsp){
	},
	
	'action' : function(act, rsp){
		var user = sesUsers[rsp.stream];
		if(user == void 0){
			rsp.error({code:-1, str:'user not authened'});
			return;
		}
		
		var map = sesMaps[user.mid];
		if(map == void 0){
			map = sesMaps[0];  // default map
		}
		
		map.client.invoke('action', act, function(err, mrsp){
			if(err){
				rsp.error(err);
			}else{
				rsp.result(mrsp);
			}
		});
	},
	
	'load' : function(user, rsp){
	},
	
	'save' : function(user, rsp){
	},
};

/*
 * management rpc handler
 * - setupRep : setup repos
 *   {host:,port:}
 * - addMap : add backend map service
 *   {host:, port:}
 * - delMap : delete backend map service
 *   {host:, port:}
 * - setupSes : setup session service
 *   {host:, port:}
 */
var sesMgmtHandler = {
	'setupRep' : function(rep, rsp){
		if (sesStatus ! = 0){
			rsp.error({code:-1, str:'session repos have setted'});
		}
		
		if(!checkRepoParam(rep)){
			rsp.error({code:-1, str:'repos param wrong'});
			return;
		}
		
		sesRepos = msgrpc.createClient(rep.port, rep.host, function(){
			sesStatus = 1;
			rsp.result({str:'ok'});
		});
	},
	
	'setupSes' : function(ses, rsp){
		if(sesStatus != 2){
			rsp.error({code:-1, str:'repos not setuped'});
			return;
		}
		
		if(!checkSesParam(ses)){
			rsp.error({code:-1, str : 'session param wrong'});
			return;
		}
		
		sesService = msgrpc.createServer();
		sesService.setHandler(sesHandler);
				
		sesService.listen(ses.port, ses.host);
		
		sesStatus = 3;
		
		rsp.result({str:'ok'});
	},
	
	'addMap' : function(map, rsp){
		if(sesStatus != 1){
			rsp.error({code:-1, str:'repos not setuped'});
			return;
		}
		
		if(!checkMapParam(map)){
			rsp.error({code:-1, str:'map param wrong'});
			return;
		}
		
		map.client = msgrpc.createClient(map.port, map.host, function(){
			sesMaps[map.id] = map;
			map.client.invoke('getMap', function(err, rsp){
			});
			
			sesStatus = 2;
			
			map.client.on('notify', function(msg){
			// add process
			});
		});
	},
	
	'delMap' : function(map, rsp){
	},
};

function setup(mgmtHost, mgmtPort){
	var host;
	var port;
	
	sesMgmtRpc = msgrpc.createServer();
	sesMgmtRpc.setHandler(sesMgmtHandler);
	
	if(mgmtHost == void 0)
		host = SES_MGMT_RPC_PORTAL.host;
	else
		host = mgmtHost;
	
	if(mgmtPort == void 0)
		port = SES_MGMT_RPC_PORTAL.port;
	else
		port = mgmtPort;
		
	sesMgmtRpc.listen(port, host);
}

var host = process.argv[2];
var port = process.argv[3];

setup(host, port);
