//
// Copyright @ 2012/08/18, All rights reserved.
// Writed by Konghan
//

var util   = require('util');
var events = require('events');
var fork   = require('child_process').fork;

//
// service(svcobj)
//   svcobj = { exec: exec_file}
//
function service(svcobj) {
    events.EventEmitter.call(this);
    
    this.exec = svcobj.exec;
    this.svcd;
    this.stat = 0; // 0:stop, 1:starting, 2:running
};

util.inherits(service, events.EventEmitter);

service.prototype.setup = function(svcobj){
	if (this.stat != 0)
	    return false;

	this.exec = svcobj.exec;
};

service.prototype.run = function() {
	if(this.stat != 0){
		logger.log('service already running : ', this.exec);
		return false;
	}
	
	logger.log('service run : ', this.exec);

	this.stat = 1;
	this.svcd = fork(this.exec);
	this.emit('ready');
	
	this.svcd.on('exit', function(code, signal){
	    this.stat = 0;
	    this.emit('exit');
	});
	
	return true;
};

service.prototype.stop = function() {
	if(this.stat == 0)
	    return true;

    this.svcd.kill('SIGHUP');
};

service.prototype.status = function() {
	return this.stat;
};

module.exports = service;

