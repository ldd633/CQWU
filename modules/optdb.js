var pool = require('../modules/connPool');
var conn =pool();

module.exports = function (sql,parma,recall) {
    conn.getConnection(function (err,connection) {
        if (err){
            console.log(err);
        } else {
            connection.query(sql,parma,function (err,rs) {
                if (err){
                    recall(err,rs);
                } else {
                    recall(null,rs);
                }
            });
            connection.release();
        }
    })

};