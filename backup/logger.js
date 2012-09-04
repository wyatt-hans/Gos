
var service = require('./service.js');

var logger_default = {  exec:'./logsvr.js',
		logfile:'mudos.log',
		address:'127.0.0.1',
		port:'2020'};

module.exports = function(logobj){

    var logconf;
    var svcobj;

    if(logobj == void 0){
	logconf = logger_default;
    }else{
	logconf = logobj;
    }

    svcobj = { exec : logconf.exec,
	       conf : logconf };

    return new service(svcobj);
}


