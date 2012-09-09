//
// copyright @ 2012/08/18, All rights reserved.
// writed by konghan
//
var util    = require('util');
var msgrpc  = require('msgpack-rpc');
var mongo   = require('mongodb');
var mongosvr=mongo.Server;
var mongodb =mongo.Db;

//var logger = require('logger.js');
var logger = console;


/*
 * repos service status : 
 * 		0 : startup
 *		1 : db connected
 *		2 : rpc servered
 */
var repStatus = 0; 

var REP_MGMT_RPC_PORTAL = {
	'host' : '127.0.0.1',
	'port' : '2010'
};

/*
 * repos management rpc service
 */
var repMgmtRpc;

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
 * repos rpc service handler
 * - authen : authenticat user
 * -- {user.name, user.passwd}
 * - addUser : add user to repos
 * -- {user.name, user.xxx}
 * - rmvUser : remove user from repos
 * -- {user.name}
 * - getUser : get user's information
 * -- {user.name}
 * - updateUser : update user's information
 * -- {user.name, user.xxx}
 * - logUer : add operating log message
 * -- {user.name, user.xxx} 
 */
var repRpcHandler = {
	'authen' : function(cred, rsp){
		logger.log('==rpc : authen');
		if(repStatus != 2){
			rsp.error({code:-1, str : 'db not ready'});
			return ;
		}
		
		var col = repMngoCot['userAuth'];
		
		logger.log('name:'+ cred.name+' passwd:'+cred.passwd);
		
		col.findOne({'name':cred.name}, function(err, cr) {
			logger.log('find return:', err);
			if(err){
				rsp.error({code:-1, str:'no user'});
				return;
			}
			logger.log('cred:', util.inspect(cr));
            
            // msgpack bugs, this will make it happy
            // delete cr._id;
            
            if(cr.passwd == cred.passwd)
	            rsp.result({str:'ok'});
	        else
	        	rsp.error({code:-1, str:'authen fail'});
        });
	},
	
	'getUser' : function(user, rsp){
		logger.log('==rpc : getUser');
		if(repStatus != 2){
			rsp.error({code:-1, str : 'db not ready'});
			return ;
		}
		
		var col = repMngoCot['userInfo'];
		
		col.findOne({name:user.name}, function(err, cr) {
			if(err){
				rsp.error({code:-1, str:'no user'});
				return;
			}
            
            // msgpack bugs, this will make it happy
            delete cr._id;
            rsp.result(cr);
        });	
	},
	
	'addUser' : function(user, rsp){
	},
	
	'rmvUser' : function(user,rsp){
	},
	
	'updateUser' : function(user, rsp) {
	}
};


/*
 * management rpc service handler functions
 * - setupDbc : setup mongodb connection
 * -- {db.host,db.port,db.name}
 * - closeDbc : close mongodb connection
 * - setupRep : setup repos rpc service
 * -- {rep.host,rep.port}
 * - closeRep : close repos rpc service
 * - getDbcStat : get mongodb connection status
 * - getRepStat : get repos rpc service status
 */
var repMgmtHandler = {
	'setupDbc' : function(db, rsp){
		logger.log('==rpc : setupDbc');
		if((db == void 0) || (db.host == void 0)
			|| (db.port == void 0) || (db.name == void 0)){
			rsp.error({code: -1, str:'mongodb service config wrong'});
			return ;
		}
		
		if(repStatus != 0){
			rsp.error({code:-1, str:'mongodb haved started'});
			return ;
		}
		
		repMngoSvr = new mongosvr(db.host, db.port,
				{auto_reconnect:true});
		
		logger.log('host:'+db.host + ' port:'+db.port+' name:'+db.name);
		
		repMngoDb = new mongodb(db.name, repMngoSvr);
		
		repMngoDb.open(function(err, mdb) {
			if(err){
				rsp.error({code:-1, str : 'open db fail'});
				return ;
			}
			
			repMngoGos = mdb;
			
			 mdb.createCollection('userAuth',function(err, col) {
				if(!err)
					repMngoCot['userAuth'] = col;
			});
			
			mdb.createCollection('userInfo',function(err, col) {
				if(!err)
					repMngoCot['userInfo'] = col;
			});
			
			mdb.createCollection('userLog',function(err, col) {
				if(!err)
					repMngoCot['userLog'] = col;
			});
			
			repStatus = 1; // db have connected 
			
			logger.log('mongodb connected ');
			rsp.result({str:'ok'});
		});
	},
	
	'setupRep' : function(repos, rsp){
		logger.log('==rpc : setupRep');
		if(repStatus != 1) {
			logger.log('mongdb not connected');
			rsp.error({code:-repStatus, str:'can\'t setup rpc service'});
			return;
		}
		
		if((repos == void 0) || (repos.host == void 0)
			|| (repos.port == void 0)){
			logger.log('rpc param wrong');
			rsp.error({code:-1, str:'without rpc service params'});
			return;
		} 
		
		rpcRpc = msgrpc.createServer();
		rpcRpc.setHandler(repRpcHandler);
		
		logger.log('rpc service setuped ');
		rpcRpc.listen(repos.port, repos.host);
		
		repStatus = 2;  // service startup
		rsp.result({str:'ok'});
	},
	
	'getDbcStat': function(){
	},
	
	'getRepStat': function(){
	},
};

/*
 * setup repos server
 * - setup management rpc service
 */
function setup(mgmtHost, mgmtPort){
	var host;
	var port;
	
	logger.log('repos start at:' + mgmtHost + ' ' + mgmtPort);
	
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

var host = process.argv[2];
var port = process.argv[3];

setup(host, port);
