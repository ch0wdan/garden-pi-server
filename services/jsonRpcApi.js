var express = require('express');
var locations   = require('./jraHandlers/locationHandlers.js');
var sensors   = require('./jraHandlers/sensorHandlers.js');
var app = express();


function start() {
    console.log('JRA: Starting web API...');
    
    app.configure(function () {
        app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
        app.use(express.bodyParser());
    });
    
    app.use(function(req, res, next){
        //Authentication
        var header=req.headers['authorization']||'',        // get the header
        token=header.split(/\s+/).pop()||'',            // and the encoded auth token
        auth=new Buffer(token, 'base64').toString(),    // convert from base64
        parts=auth.split(/:/),                          // split on colon
        username=parts[0],
        password=parts[1];
        req.username = username;
        
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
     
    app.listen(3001);
    console.log('JRA: Web API running on port %d in %s mode...',
                    3001, 'dev');//app.address().port, app.settings.env);
}

exports.start = start;