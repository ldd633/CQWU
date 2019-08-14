var masql = require('mysql');
module.exports = function () {
    var pool = masql.createPool({
        host:'localhost',
        user:'root',
        password:'',
        database:'db',
        port:3306
    });
    pool.on('connection',function (connection) {
        connection.query("SET SESSION auto_increment_increment=1");
    });
    return function () {
        return pool;
    }
}();