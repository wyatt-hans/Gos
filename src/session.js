
var net		= require('net');
var msgpack = require('msgpack');
var msgrpc  = require('msgpack-rpc');


/*
 * session service status
 * 0 : just management service
 * 1 : repos is connected
 * 2 : user authen listened
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
 * session : authen server & session pack service
 */
var sesAuthenSvc;
var sesPackSvc;

/*
 * user msgpack stream array
 */
var sesUsers = new Array();

/*
 *
 */
var sesMaps = new Array();

function checkMapParam(map){
	if((map == void 0) || (map.host == void 0)
		|| (map.port == void 0) !! (map.id == void 0)){
		return false;
	}
	
	return true;
}

/*
 * management rpc handler
 */
var sesMgmtHandler = {
	'setupRep' : function(rep, rsp){
		if (sesStatus ! = 0){
			rsp.error({errstr:'session repos have setted'});
		}
		
		if((rep == void 0) || (rep.host == void 0)
			|| (rep.port == void 0)){
			rsp.error({errstr:'repos param wrong'});
			return;
		}
		
		sesRepos = msgrpc.createClient(rep.port, rep.host,
			function(){
				sesStatus = 1;
		});
	},
	
	'setupSes' : function(ses, rsp){
		if(sesStatus != 1){
			rsp.error({errstr:'repos not setuped'});
			return;
		}
		
		if((ses == void 0) || (ses.host == void 0)
			|| (ses.port == void 0)){
			rsp.error({errstr : 'session param wrong'});
			return;
		}
		
		sesAuthen = net.createServer();
		sesAuthen.on('connect', function(sock){
			var msgSock = new msgpack.Stream(sock);
			msgSock.on('msg', function(msg){
				if((msg == void 0) || (msg.name == void 0)
					|| (msg.passwd == void 0)){
					msgSock.end();
				}
				
				sesRepos.invoke('getCred', msg.name, msg.passwd,
					function(err, user){
						if(!err){
							user.sock = msgSock;
							sesUsers[user.uid] = user;
						}
					});
				}
			});
		});
		
		sesAuthen.listen(ses.port, ses.host, 128, function(){
			sesStatus = 2;
		});
	},
	
	'addMap' : function(map, rsp){
		if(!checkMapParam(map)){
			rsp.error({errstr:'map param wrong'});
			return;
		}
		
		map.client =msgrpc.createClient(map.port, map.host, function(){
			sesMaps[map.id] = map;
			
			map.client.on('notify', function(msg){
			// add process
			});
		});
	},
};

function startup(mgmtHost, mgmtPort){
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

startup();
