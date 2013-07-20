var mySqlPool = require('../common/mySqlConnectionPool.js').getPool;
var async  = require('async');
var url = require('url') ;

function listAllTypes(req, res) {
    var fncMySqlConn;
    
    async.waterfall([
        function(callback) {
            mySqlPool.getConnection(callback);
        },
        function(mySqlConn, callback) {
            fncMySqlConn = mySqlConn;
            fncMySqlConn.query('SELECT * FROM sensor_type', callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                callback(null, rows);
            } else {
                res.send({ error_message : 'Unable to read sensor types or no sensor types exist!' }, 404);
            }
        }],
        function (err, result) {
            fncMySqlConn.end();
            if (!err) {
                res.write(JSON.stringify(result));                
                res.end();
            } else {
                console.log('JRA: ERROR connecting to MySQL!');
                console.log(err);
                res.send({ error_message : 'SQL Error!' }, 500);
            }
        }
    );
    
}

function listAllRoles(req, res) {
    var fncMySqlConn;
    
    async.waterfall([
        function(callback) {
            mySqlPool.getConnection(callback);
        },
        function(mySqlConn, callback) {
            fncMySqlConn = mySqlConn;
            fncMySqlConn.query('SELECT * FROM sensor_role', callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                callback(null, rows);
            } else {
                res.send({ error_message : 'Unable to read sensor roles or no sensor roles exist!' }, 404);
            }
        }],
        function (err, result) {
            fncMySqlConn.end();
            if (!err) {
                res.write(JSON.stringify(result));                
                res.end();
            } else {
                console.log('JRA: ERROR connecting to MySQL!');
                console.log(err);
                res.send({ error_message : 'SQL Error!' }, 500);
            }
        }
    );
    
}

function getReadingsForGardenRoleCurrentCrop(req, res) {
    var fncMySqlConn;
    var queryParams = url.parse(req.url,true).query;
    var startdate = queryParams.startdate;
    var enddate = queryParams.enddate;
    if ((!startdate) || (!enddate) || enddate.length != 8 || startdate.length != 8){
        res.send({ error_message : 'Startdate and enddate query string params must be exactly 8 characters each!' }, 400);
        return;
    }
    startdate += '000000';
    enddate += '000000';
    
    async.waterfall([
        function(callback) {
            mySqlPool.getConnection(callback);
        },
        function(mysqlConn, callback) {
            fncMySqlConn = mysqlConn;
            fncMySqlConn.query('SELECT sr.id, sr.id_sensor, sr.reading_value, sr.reading_instant, sr.reading_data IS NOT NULL AS reading_has_data ' +
                                'FROM garden_sensor_role gsr ' +
                                'JOIN garden g ON gsr.id_garden = g.id ' +
                                'JOIN location l ON g.id_location = l.id ' +
                                'JOIN user_location_permission ulp ON ulp.id_location = l.id  ' +
                                'JOIN user u ON ulp.id_user = u.id AND u.username = ' + fncMySqlConn.escape(req.username) + ' ' +
                                'JOIN sensor_reading sr on sr.id_crop = g.id_crop and sr.id_garden_sensor_role = gsr.id ' +
                                'WHERE gsr.id = ' + fncMySqlConn.escape(req.params.gardenRoleId) + ' ' +
                                'AND reading_instant >= ' + fncMySqlConn.escape(startdate) + ' AND reading_instant < DATE_ADD( ' + fncMySqlConn.escape(enddate) + ', INTERVAL 1 DAY) ' +
                                'order by reading_instant', callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                callback(null, rows);
            } else {
                res.send({ error_message : 'Location permission denied or no entries for garden role, curent crop and date range specified.' }, 404);
            }
        }],
        function (err, result) {
            fncMySqlConn.end();
            if (!err) {
                res.write(JSON.stringify(result));                
                res.end();
            } else {
                console.log('JRA: ERROR connecting to MySQL!');
                console.log(err);
                res.send({ error_message : 'SQL Error!' }, 500);
            }
        }
    );
}

function getReadingsForLocationRole(req, res) {
    var fncMySqlConn;
    var queryParams = url.parse(req.url,true).query;
    var startdate = queryParams.startdate;
    var enddate = queryParams.enddate;
    if ((!startdate) || (!enddate) || enddate.length != 8 || startdate.length != 8){
        res.send({ error_message : 'Startdate and enddate query string params must be exactly 8 characters each!' }, 400);
        return;
    }
    startdate += '000000';
    enddate += '000000';
    
    async.waterfall([
        function(callback) {
            mySqlPool.getConnection(callback);
        },
        function(mysqlConn, callback) {
            fncMySqlConn = mysqlConn;
            fncMySqlConn.query('SELECT sr.id, sr.id_sensor, sr.reading_value, sr.reading_instant, sr.reading_data IS NOT NULL AS reading_has_data ' +
                                'FROM location_sensor_role lsr ' +
                                'JOIN location l ON lsr.id_location = l.id ' +
                                'JOIN user_location_permission ulp ON ulp.id_location = l.id  ' +
                                'JOIN user u ON ulp.id_user = u.id AND u.username = ' + fncMySqlConn.escape(req.username) + ' ' +
                                'JOIN sensor_reading sr on sr.id_location_sensor_role = lsr.id ' +
                                'WHERE lsr.id = ' + fncMySqlConn.escape(req.params.locationRoleId) + ' ' +
                                'AND reading_instant >= ' + fncMySqlConn.escape(startdate) + ' AND reading_instant < DATE_ADD( ' + fncMySqlConn.escape(enddate) + ', INTERVAL 1 DAY) ' +
                                'order by reading_instant', callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                callback(null, rows);
            } else {
                res.send({ error_message : 'Location permission denied or no entries for location role and date range specified.' }, 404);
            }
        }],
        function (err, result) {
            fncMySqlConn.end();
            if (!err) {
                res.write(JSON.stringify(result));                
                res.end();
            } else {
                console.log('JRA: ERROR connecting to MySQL!');
                console.log(err);
                res.send({ error_message : 'SQL Error!' }, 500);
            }
        }
    );
}

exports.getReadingsForGardenRoleCurrentCrop = getReadingsForGardenRoleCurrentCrop;
exports.getReadingsForLocationRole = getReadingsForLocationRole;
exports.listAllRoles = listAllRoles;
exports.listAllTypes = listAllTypes;