//
// copyright @ 2012/08/18, All rights reserved.
// writed by konghan
//

var msgrpc  = require('msgpack-rpc');
var msgpack = require('msgpack');
//var logger = require('logger.js');
var logger = console;

function userInfo(uid, cmap, node, sockHandle){
    this._uid  = uid;	// user id;
    this._sock = sockHandle; // user socket connection
    this._cmap = cmap;   // user current map
    this._node = node;  // user current location;
    this._msgsock;
};

function usersvcd(){
    // map svcd handles
    this._maps = new Array();
    // users connect by this svcd
    this._users = new Array();
    // session rpc client
    this._sessions;

    // management rpc server
    this._msvcd = msgrpc.createServer();
    this._mConf;
    this._mHandler = {
	'echo' : function(rsp){
	    logger.info('rpc echo be called');
	    rsp.result('live');
	}
    };
    this._msvcd.setHandler(this._mHandler);
};

usersvcd.prototype.setup = function(usvc, msvc){
    logger.info('usersvcd=> setup : ', usvc, msvc);

    this._uConf = usvc;
    this._mConf = msvc;
};

usersvcd.prototype.run = function(){
    logger.info('usersvcd=> listen : ');
    logger.info('           ',this._uConf.host, this._uConf.port);
    logger.info('           ',this._mConf.host, this._mConf.port);

    this._usvcd.listen(this._uConf.port, this._uConf.host);
    this._msvcd.listen(this._mConf.port, this._mConf.host);
};

usersvcd.prototype.stop = function(){
    this._usvcd.stop();
    this._msvcd.stop();
};

var usvcd = new usersvcd();

//console.log('usersvcd=> load');

process.on('message', function(m, sockHandle){
    logger.info('usersvcd=> get message ', m);

    switch(m.message){
    case 'config':
        usvcd.setup(m.config.uconf, m.config.mconf);
	usvcd.run();
	break;

    case 'adduser':
	var ui = new userInfo(m.user.id, m.user.map,
		m.user.node, sockHandle);
	
	ui._msgsock = new msgpack.Stream(sockHandle);
	usvcd._users[m.user.id] = ui;

	ui._msgsock.on('msg', function(m){
	    // call rpc(usvcd._maps[m.cmap]);
	});

	ui._msgsock.on('end',function(){
	    delete usvcd._users[m.user.id];
	    // call rpc session end
	    });

	break;
    }
});

