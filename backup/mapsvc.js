//
// copyright @ 2012/08/18, All rights reserved.
// writed by konghan
//

var msgrpc  = require('msgpack-rpc');
var msgpack = require('msgpack');
//var logger = require('logger.js');
var logger = console;

function mapsvcd(){
    this._repos;

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

mapsvcd.prototype.setup = function(msvc){
    logger.info('mapsvcd=> setup : ', usvc, msvc);

    this._mConf = msvc;
};

mapsvcd.prototype.run = function(){
    logger.info('mapsvcd=> listen : ');
    logger.info('           ',this._mConf.host, this._mConf.port);

    this._msvcd.listen(this._mConf.port, this._mConf.host);
};

mapsvcd.prototype.stop = function(){
    this._msvcd.stop();
};

var ssd = new mapsvcd();

//console.log('mapsvcd=> load');

process.on('message', function(m){
    logger.info('mapsvcd=> get message ', m);

    switch(m.message){
    case 'config':
        ssd.setup(m.config.mconf);
	ssd.run();
	break;

    default:
	logger.info('mapsvcd=> get unkown message');
	break;
    }
});

