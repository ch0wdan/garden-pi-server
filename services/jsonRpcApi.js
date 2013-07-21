var express = require('express');
var http = require('http');
var locations   = require('./jraHandlers/locationHandlers.js');
var sensors   = require('./jraHandlers/sensorHandlers.js');
var app = express();


function start() {
    console.log('JRA: Starting web API...');
    
    app.use(express.bodyParser());
    app.use(function(req, res, next){
        //Authentication
        var header=req.headers['authorization']||'',    
        token=header.split(/\s+/).pop()||'',            // get encoded auth token
        auth=new Buffer(token, 'base64').toString(),    // base64 to string
        parts=auth.split(/:/),                          // split on colon
        username=parts[0],
        password=parts[1];
        req.username = username;
        //Requires some username
        if (!username) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
            res.statusCode = 401;
            res.end();
            return;
        }
        next();
    });
    if ('development' == app.get('env')) {
        app.use(express.static(__dirname.replace('\services', '\web')));
        app.use(express.logger('dev'));
    }
    if ('production' == app.get('env')) {
        app.use(express.logger('default'));
    }
    
    app.use(function(req, res, next){
        //Json Header
        res.setHeader("Content-Type", "application/json; charset=utf-8;");
        next();
    });
    app.get('/locations', locations.listAll);
    app.get('/locations/:id', locations.getDetailsForId);
    app.get('/sensors/roles', sensors.listAllRoles);
    app.get('/sensors/types', sensors.listAllTypes);
    app.get('/sensor_readings/garden_role/:gardenRoleId', sensors.getReadingsForGardenRoleCurrentCrop);
    app.get('/sensor_readings/location_role/:locationRoleId', sensors.getReadingsForLocationRole);
     
    var server = http.createServer(app);
    server.listen(3001);
    console.log('JRA: Web API running on port %d in %s mode...',
                    server.address().port, app.get('env'));
}

exports.start = start;