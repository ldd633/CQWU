var events = require('events');
var table = require('./optdb');
module.exports = function () {
    this.eventEmit = new events.EventEmitter();
    var _this = this;
    this.regist = function (req, res) {
        var sql = `INSERT INTO user(username, password, nc) VALUES (?,?,?)`;
        var param = [req.body['username'], req.body['password'], req.body['nc']];
        table(sql, param, function (err, rs) {
            if (err) {
                if (err.code = 'ER_DUP_ENTRY') {
                    res.json(0);
                } else
                    console.log(err);
            } else {
                res.json(rs.affectedRows);
                req.session.userInfo = {username: req.body['username'], nc: req.body['nc']};
                _this.eventEmit.emit('success');
            }
        })
    };
    this.login = function (req, res) {
        if (req.session.userInfo) {//注册后直接登录的情况
            console.log(req.session.userInfo);
            res.json(req.session.userInfo);
        } else {//直接登录情况
            if (req.body['yzm'].toUpperCase() !== req.session.idCode.toUpperCase()) {
                res.json(0);//验证码错误
            }else {
                var sql = 'select * from user where username=? and password=?';
                var param = [req.body['username'], req.body['password']];
                table(sql, param, function (err, rs) {
                    if (err) {
                        console.log(err);
                    } else if (rs.length !== 0) {
                        req.session.userInfo = {username: rs[0].username,nc: rs[0].nc};
                        res.json(rs)//登录成功
                    }else {
                        res.json(2)//用户名或者密码不正确
                    }
                })
            }

        }
    }
};