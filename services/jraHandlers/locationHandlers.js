var mySqlPool = require('../common/mySqlConnectionPool.js').getPool;
var async  = require('async');

function listAll(req, res) {
    var fncMySqlConn;
    
    async.waterfall([
        function(callback) {
            mySqlPool.getConnection(callback);
        },
        function(mysqlConn, callback) {
            fncMySqlConn = mysqlConn;
            mysqlConn.query('SELECT l.*, case u.id_location_default when l.id then true else false end as is_default FROM location l ' +
                            'JOIN user_location_permission ulp on ulp.id_location = l.id ' +
                            'JOIN user u on ulp.id_user = u.id and u.username = ' + mysqlConn.escape(req.username), callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                res.write(JSON.stringify(rows));
                res.end();
            } else {
                res.send({ error_message : 'User has no permission on any locations or no locations exist!' }, 403);
            }
        }],
        function (err, result) {
            fncMySqlConn.end();
            if (err) {
                console.log('JRA: ERROR connecting to MySQL!');
                console.log(err);
                res.send({ error_message : 'SQL Error!' }, 500);
            }
        }
    );
}

function getDetailsForId(req, res) {
    var fncMySqlConn;
    var resultHash = {};
    
    async.waterfall([
        function(callback) {
            mySqlPool.getConnection(callback);
        },
        /** LOCATIONS **/
        function(mysqlConn, callback) {
            fncMySqlConn = mysqlConn;
            fncMySqlConn.query('SELECT l.* FROM location l ' +
                            'JOIN user_location_permission ulp on ulp.id_location = l.id ' +
                            'JOIN user u on ulp.id_user = u.id and u.username = ' + fncMySqlConn.escape(req.username) + ' and l.id = ' + fncMySqlConn.escape(req.params.id), callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                resultHash.location = rows[0];
                callback();
            } else {
                res.send({ error_message : 'Location permission denied!' }, 403);
            }
        },
        /** GARDENS **/
        function(callback) {
            fncMySqlConn.query('SELECT g.* FROM location l ' +
                                    'JOIN garden g on g.id_location = l.id ' +
                                    'and l.id = ' + fncMySqlConn.escape(req.params.id), callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                resultHash.gardenList = rows;
            }
            callback();
        },
        /** CROPS **/
        function(callback) {
            fncMySqlConn.query('SELECT c.* FROM location l ' +
                                    'JOIN crop c on c.id_location = l.id ' +
                                    'and l.id = ' + fncMySqlConn.escape(req.params.id), callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                resultHash.cropList = rows;
            }
            callback();
        },
        /** LOCATION SENSOR ROLES + SENSORS **/
        function(callback) {
            fncMySqlConn.query('SELECT s.id_location_sensor_role, s.id as id_sensor, lsr.id_sensor_role,s.id_sensor_type, s.serial_number ' +
                                'FROM location_sensor_role lsr JOIN sensor s ON lsr.id = s.id_location_sensor_role ' +
                                'WHERE lsr.id_location = ' + fncMySqlConn.escape(req.params.id), callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                resultHash.location.sensors = rows;
            }
            callback();
        },
        /** GARDEN SENSOR ROLES + SENSORS **/
        function(callback) {
            if (!resultHash.gardenList) { callback(null, resultHash); return; }
            async.each(resultHash.gardenList, getSensorInfoForGarden, function(err){
                callback(err, resultHash);
            });
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

function getSensorInfoForGarden(garden, pri_callback) {
    var fncMySqlConn;
    
    async.waterfall([
        function(callback) {
            mySqlPool.getConnection(callback);
        },
        /** GARDEN SENSOR ROLES + SENSORS **/
        function(mySqlConn, callback) {
            fncMySqlConn = mySqlConn;
            fncMySqlConn.query('SELECT s.id_garden_sensor_role, s.id as id_sensor, gsr.id_sensor_role,s.id_sensor_type, s.serial_number ' +
                                'FROM garden_sensor_role gsr JOIN sensor s ON gsr.id = s.id_garden_sensor_role ' +
                                'WHERE gsr.id_garden = ' + fncMySqlConn.escape(garden.id), callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                garden.sensors = rows;
            }
            callback(null, garden);
        }],
        function (err, result) {
            fncMySqlConn.end();
            pri_callback(err);
        }
    ); 
    
}

exports.listAll = listAll;
exports.getDetailsForId = getDetailsForId;