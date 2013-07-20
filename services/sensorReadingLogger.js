var amqp   = require('amqp');
var mysql  = require('mysql');
var async  = require('async');
 
var mysqlConn = mysql.createConnection({
    host : '192.168.1.30',
    user : 'root',
    password : 'IAh40IcO1z73',
    database : 'garden_pi'
});
 
var amqpConn = amqp.createConnection({
    host: '192.168.1.92',
    port: 5672,
    login: 'cameron',
    password: 'cameron',
    vhost: '/'
});

var queue;
    
function start() {
    console.log('SRL: Connecting to AMPQ Broker and MySQL...');
    async.parallel([
        function(callback){
            amqpConn.addListener('ready', callback);
            amqpConn.addListener('error', callback);
        },
        function(callback){
            mysqlConn.connect(callback);
        }
    ], main);
}

function main(err, result) {
    if (err) 
    {
        console.log('SRL: ERROR connecting to AMQP Broker or MySQL!');
        console.log(err); 
    } else {
        console.log('SRL: Connected to AMQP Broker and MySQL.');
        
        queue = amqpConn.queue('sensor_readings', {
            durable: true,
            autoDelete: false
        });
         
        //Subscribe to the queue
        queue.subscribe({ack: true}, function(message) {
            messageHandler(message);
        });

    }
}

function messageHandler (message) {
    var retVal = true;

    async.waterfall([
        function(callback) {
            mysqlConn.query('SELECT s.id, s.id_garden_sensor_role, s.id_location_sensor_role, ' +
                                'g.id_crop FROM sensor s ' +
                                'LEFT JOIN garden_sensor_role gsr ON gsr.id = s.id_garden_sensor_role ' +
                                'LEFT JOIN garden g on g.id = gsr.id_garden ' +
                                'WHERE serial_number = ' + mysqlConn.escape(message.sensorId), callback);
        },
        function(rows, fields, callback) {
            if (rows.length > 0) {
                console.log('SRL: Sensor reading received: ' + JSON.stringify(message));
                mysqlConn.query('INSERT INTO sensor_reading ' +
                '(id_sensor, id_location_sensor_role, id_garden_sensor_role, id_crop, reading_value, reading_instant) VALUES ' +
                '(' + mysqlConn.escape(rows[0].id) + ', ' + mysqlConn.escape(rows[0].id_location_sensor_role) + ', ' + mysqlConn.escape(rows[0].id_garden_sensor_role) + ', ' + 
                mysqlConn.escape(rows[0].id_crop) + ', ' +  mysqlConn.escape(message.reading) + ', ' + mysqlConn.escape(message.dateTime) + ')', callback);
            } else {
                console.log('SRL: Unable to find sensor with serial number "' + message.sensorId + '" in database! Reading orphaned!');
                mysqlConn.query('INSERT INTO sensor_reading_orphaned ' +
                '(serial_number, reading_value, reading_instant) VALUES ' +
                '(' + mysqlConn.escape(message.sensorId) + ', ' + mysqlConn.escape(message.reading) + ', ' + mysqlConn.escape(message.dateTime) + ')', callback);
            }
        }],
        function (err, result) {
            if (err) {
                console.log('SRL: MySQL ERROR ' + err); throw err;
            } else {
                queue.shift();
            }
        }
    );
};

exports.start = start;