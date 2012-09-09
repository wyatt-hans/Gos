//
// copyright @ 2012/09/08, All rights reserved.
// writed by konghan
//

var fs  	= require('fs');
var util	= require('util');
var timer	= require('timers');

var msgrpc  = require('msgpack-rpc');

var svc 	= require('../src/service.js');

var mainConfObject;
// repo array
var mainRepos = new Array();


function loadConfig(cf){
	var conf = fs.readFileSync(cf);
	
	var confObj = JSON.parse(conf);
	
	console.log(util.inspect(confObj));
	
	return confObj;
}

function setupRepo(repo, cbFunc){
//	var repo;
//	for(repo in repos){
		console.log('create repos service at:' + repo.host + ' ' + repo.port);
		
		var repsvc = svc.createService('../src/repos.js', repo.host, repo.port);
		
		timer.setTimeout(function(){
		
		var rpc = msgrpc.createClient(repo.port, repo.host, function(){
			
			console.log('repo management rpc connected');
			
			rpc.invoke('setupDbc', {host:repo.mdbhost, port:repo.mdbport, name:'Gos'}, function(err,rsp){
				console.log('repos setupDbc return:', err);
				if(!err){
					rpc.invoke('setupRep', {host:repo.rephost, port:repo.repport},function(err,rsp){
						console.log('repos setupRep return:', err);
						if(!err){
							mainRepos.push(repsvc);
							cbFunc();
						}
					});
				}
			});
		});
		}, 1000);
//	}
}

function setupSession(sessions, repo, cbFunc){
	console.log('setupSession');
	
	cbFunc();
}

function main(){
	mainConfObject = loadConfig(__dirname + '/../Gos.conf');
	
	console.log('-----------------------------');
	
	setupRepo(mainConfObject.repos, function(){
		setupSession(mainConfObject.sessions, mainConfObject.repos, function(){
			console.log('setup session ok');
		});
	});
}

main();

