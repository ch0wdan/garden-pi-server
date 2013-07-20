var mysql = require('mysql');

var mysqlConnPool = mysql.createPool({
    host : '192.168.1.30',
    user : 'root',
    password : 'IAh40IcO1z73',
    database : 'garden_pi'
});

exports.getPool = mysqlConnPool;