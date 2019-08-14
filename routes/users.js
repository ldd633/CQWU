var express = require('express');
var router = express.Router();
var table = require('../modules/optdb');
var async = require('async');
var svgCaptcha = require('svg-captcha');
// var session = require('express-session');
var Event = require('../modules/event');
var event = new Event();
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/detail', function (req, res, next) {
    var id = req.query['id'];
    // console.log(id);
    var sql = 'select * from news where id=?';
    table(sql, [id], function (err, rs) {
        if (err) {
        } else {
            res.render('users/detail', {arr: rs});
        }
    })

});

router.get('/list1', function (req, res, next) {
    var curPage, totalPages;
    var sql = 'select * from news order by id desc limit 4';
    table(sql, [], function (err, rs) {
        if (err) {
            console.log(err);
        } else {
            res.render('users/list1', {arr: rs});
        }
    })
});
router.get('/list/:curPage', function (req, res, next) {
    async.series({
        totalPages: function (done) {
            var sql = 'select * from news';
            table(sql, [], function (err, rs) {
                if (err) {
                    console.log(err);
                } else {
                    totalPages = Math.ceil(rs.length / 4);
                    done(null, totalPages);
                }
            });
        },
        data: function (done) {
            curPage = req.params['curPage'];
            if (curPage < 0) curPage = 0;
            if (curPage > totalPages - 1) curPage = totalPages - 1;
            var start = curPage * 4;
            var sql = 'select * from news order by id desc limit ?,?';
            table(sql, [start, 4], function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    // curPage++;
                    done(null, data)
                }
            })
        }
    }, function (err, rs) {
        if (err) {
            console.log(err);
        } else {
            if (curPage > totalPages - 1) {
                curPage = totalPages - 1;
            } else if (curPage < 1) {
                curPage = 0;
            }
            res.render('users/list', {rs: rs, curPage: parseInt(curPage)});
        }
    });

});
router.get('/search', function (req, res, next) {
    var keyWord = req.query['keyWord'];
    var sql = `select * from news where title like '%${keyWord}%' order by id desc`;
    table(sql, [], function (err, rs) {
        if (err) {
            console.log(err);
        } else {
            res.render('users/search', {rs: rs});
        }
    });
});
router.post('/regist', function (req, res, next) {
    console.log(123)
    event.eventEmit.once('success',function () {
        event.login(req,res);
    });
    event.regist(req,res);
});
router.post('/login', function (req, res, next) {
    // console.log(event)
    // event.login(req,res);
});
router.get('/isLogin', function (req, res, next) {
    if (req.session.userInfo){
        res.json(req.session.userInfo.nc)
    }
});
router.get('/getIdCode', function (req, res, next) {
    var codeConfig = {
        size: 4,// 验证码长度
        ignoreChars: '0o1li', // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        height:50
    };
    var captcha = svgCaptcha.create(codeConfig);
    req.session.idCode = captcha.text;
    res.json(captcha);
});
router.get('/logout', function (req, res, next) {
    delete req.session.userInfo;
    res.json(1);
});

module.exports = router;
