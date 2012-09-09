
var msgrpc = require('msgpack-rpc');

var service = require(__dirname + '/service.js');
//var logger  = require(__dirname + '/logger.js');

//logsvr = logger();
//logsvr.run();
//log = new logcli(process.id, '127.0.0.1', 5500);
//log.setup();
//log.log('first message');


var repos   = new service(__dirname + 'repos.js');
var session = new service(__dirname + 'session.js');

repos.run();
session.run();

var mgodb = {host:'127.0.0.1', port:'27017', db:'gos'};
var reprpc = {host:'127.0.0.1', port:'2012'};
var ses = { host:'127.0.0.1',port:'2020'};

var scli;

var rcli = msgrpc.createServer(mgodb.port, mgodb.host, function(){
	
	rcli.invoke('setupMngo', mgodb, function(err, rsp){
		logger.log('setup mongodb : ', err);
	});
	
	rcli.invoke('setupRepos', reprpc, function(err, rsp){
		logger.log('setupRepos : ', err);
		if(!err){
			scli = msgrpc.createServer(ses.port, ses.host, function(){
			scli.invoke('setupRep', reprpc, function(err, rsp){
				logger.log('setup rep rcp : ',err);
			});
			});
		}
	});
});

