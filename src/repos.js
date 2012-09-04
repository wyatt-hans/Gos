//
// copyright @ 2012/08/18, All rights reserved.
// writed by konghan
//

var msgrpc  = require('msgpack-rpc');
var mongo   = require('mongodb');

//var logger = require('logger.js');
var logger = console;


/*
 * repos service status : 
 * 		0 : startup
 *		1 : db connected
 *		2 : rpc servered
 */
var repStatus = 0; 

/*
 * repos management rpc service
 */
var repMgmtRpc;

var REP_MGMT_RPC_PORTAL = {
	'host' : '127.0.0.1',
	'port' : '2010'
};

/*
 * repos rpc service 
 */
var repRpc;

/*
 * mongodb server, db and collections
 */
var repMngoSvr;
var repMngoDb;
var repMngoGos;
var repMngoCot = new Array();

/*
 * rpc handler
 */

var repRpcHandler = {
	'getCred' : function(cred, rsp){
		if(repStatus != 2){
			rsp.error({errstr : 'db not ready'});
			return ;
		}
		
		var col = repMngoCot['cred'];
		
		col.findOne({'name':cred.name}, function(err, cr) {
			if(err){
				rsp.error({errstr:'no user'});
				return;
			}
            
            // msgpack bugs, this will make it happy
            delete cr._id;
            rsp.result(cr);
        });
	},
	
	'getUser' : function(user, rsp){
		if(repStatus != 2){
			rsp.error({errstr : 'db not ready'});
			return ;
		}
		
		var col = repMngoCot['players'];
		
		col.findOne({'uid':user.uid}, function(err, cr) {
			if(err){
				rsp.error({errstr:'no user'});
				return;
			}
            
            // msgpack bugs, this will make it happy
            delete cr._id;
            rsp.result(cr);
        });	
	},
	
	'addUser' : function(user, rsp){
	},
	
	'update' : function(user, rsp) {
	}
};


/*
 * management handler 
 */
var repMgmtHandler = {
	'setupMngo' : function(mngo, rsp){
		if((mngo == void 0) || (mngo.host == void 0)
			|| (mngo.port == void 0) || (mngo.db == void 0)){
			rsp.error({errstr:'mongodb service config wrong'});
			return ;
		}
		
		if(repStatus != 0){
			rsp.error({errstr:'mongodb haved started'});
			return ;
		}
		
		repMngoSvr = new mongo.Server(mngo.host, mngo.port,
				{auto_reconnect:true});
				
		repMngoDb = new mongo(mngo.db, repMngoSvr);
		
		repMngoDb.open(function(err, db) {
			if(err){
				rsp.error({errstr : 'open db fail'});
				return ;
			}
			
			repMngoGos = db;
			
			repMngoCot['cred'] = db.createCollection('cred');
			repMngoCot['players'] = db.createCollection('players');
			
			repStatus = 1; // db have connected 
			
			rsp.result();
		});
	},
	
	'setupRepos' : function(repos, rsp){
		if(repStatus != 1) {
			rsp.error({errstr:'can\'t setup rpc service',
					   errcode: repStatus});
			return;
		}
		
		if((repos == void 0) || (repos.host == void 0)
			|| (repos.port == void 0)){
			rsp.error({errstr:'without rpc service params'});
			return;
		} 
		
		rpcRpc = msgrpc.createServer();
		rpcRpc.setHandler(repRpcHandler);
		
		repStatus = 2;  // service startup
		
		rpcRpc.listen(port, host);
		
	},
	
	'getMngoStat': function(){
	},
};

function startup(mgmtHost, mgmtPort){
	var host;
	var port;
	
	rpcMgmtRpc = msgrpc.createServer();
	rpcMgmtRpc.setHandler(repMgmtHandler);
	
	if(mgmtHost == void 0)
		host = REP_MGMT_RPC_PORTAL.host;
	else
		host = mgmtHost;
	
	if(mgmtPort == void 0)
		port = REP_MGMT_RPC_PORTAL.port;
	else
		port = mgmtPort;
		
	rpcMgmtRpc.listen(port, host);
}

startup();

//exports.startup = startup;

