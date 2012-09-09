//
// Copyright @ 2012/08/18, All rights reserved.
// Writed by Konghan
//

var fork   = require('child_process').fork;
var logger = console;

function service(){
	this.svcd;
	this.status = 0;
}

function createService() {
	var len = arguments.length;
	var args = new Array();

	if(len < 1){
		logger.log('create service without exec');
		return;
	}
	
	var exec = arguments[0];
	
	for (var i = 1; i < len; i++)
		args.push(arguments[i]);
	
	
	logger.log('service run : ' + exec + ' ' + args.join(' '));
	
	
	var svc = new service();
	
	svc.svcd = fork(exec, args);
	svc.status = 1;
	
	return svc;
}

function deleteService(svc){
	if(svc.status != 0)
		svc.svcd.kill('SIGHUP');
}

module.exports.createService = createService;
module.exports.deleteService = deleteService;

