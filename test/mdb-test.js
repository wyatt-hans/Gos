var util    = require('util');
var msgpack = require('msgpack-rpc');
var mongodb = require('mongodb');
var msvr = mongodb.Server;
var mdb = mongodb.Db;


var mpack = require('msgpack');

function dbTest(){

//    this._msgrpc = msgpack.createServer();

    this._svr = new msvr('127.0.0.1', 27017, {auto_reconnect:true});
    this._db  = new mdb('mudos',this._svr);
}

var connect;
var msgrpc;
var collect;

var handler = {
    'echo':function(name, rsp){

        console.log('handler be called : ', name);

//      console.log('db : ', util.inspect(this._opened));
        connect.createCollection('cred', function(err, col){
            collect = col;
            col.findOne({'name':name}, function(err, docs) {
                delete docs._id;
                console.log('find record : ', docs);

                console.log('recored name:', docs.name);

                if(!err){
                    rsp.result(docs);
                }
            });
        });

        console.log('collect : ', util.inspect(collect));
    },

    'got':function(name,rsp){
        collect.findOne({'name':name}, function(err, docs){
            delete docs._id;
            rsp.result(docs);
        });
    }
};

msgrpc = msgpack.createServer();
msgrpc.setHandler(handler);

dbTest.prototype.run = function(){
        this._db.open(function(err, db) {
                connect = db;
                msgrpc.listen('2020', '127.0.0.1');
        });
}

var db = new dbTest();

console.log('have create db');

db.run();

