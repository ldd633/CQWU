var express = require('express');
var router = express.Router();
var table = require('../modules/optdb');
var multiparty = require('multiparty');
var fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('admin/manage');
});
//添加新闻
router.post('/addNews', function (req, res, next) {
    var form = new multiparty.Form();//新建表单
    //设置编辑
    form.encoding = 'utf-8';
    //设置图片存储路径
    form.uploadDir = "public/upImg";
    form.keepExtensions = true;   //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //内存大小
    form.maxFilesSize = 5 * 1024 * 1024;//文件字节大小限制，超出会报错err

    //表单解析
    form.parse(req, function (err, fields, files) {
        //获取路径
        // console.log(fields)
        // console.log(files)
        var oldpath = files.imgpath[0]['path'];
        //获取文件后缀名
        var ext = oldpath.split('.');
        ext = ext[ext.length-1];
        var date = new Date();
        var url = 'public/upImg/' + Date.now() +'.' +ext;
        var url1 = 'upImg/' + Date.now() +'.' +ext;
        var sql = 'insert into news (title,imgpath,date,content) values(?,?,?,?)';
        var parma = [fields.title[0], url1, date, fields.content[0]];
        table(sql, parma, function (err,rs) {
            if (rs) {
                var sql = 'select * from news order by id desc limit 1';
                table(sql, [], function (err,rs) {
                    res.json(rs);
                })
            }
        });
        //给图片修改名称
        fs.renameSync(oldpath, url);
    });
});
//搜索新闻
router.get('/searchNews',function (req,res,next) {
    var keyWord = req.query['keyWord'];
    var sql = `select * from news where title like '%${keyWord}%' order by id desc limit 1`;
    table(sql, [], function (err,rs) {
        res.json(rs);
    });
});
//修改新闻
router.get('/editNews',function (req,res,next) {
    var sql = 'UPDATE `news` SET `title`=?,`content`=? WHERE id=?';
    table(sql, [req.query.title,req.query.content,req.query.id], function (err,rs) {
        res.json(rs.affectedRows);
    });
});
//修改图片
router.post('/editImg',function (req,res,next) {
    var imgpath = req.query.oldImg;
    var sql = 'select * from news where imgpath=?';
    table(sql, [imgpath], function (err,rs) {

        var multiparty = require('multiparty');
        var form = new multiparty.Form();//新建表单
        //设置编辑
        form.encoding = 'utf-8';
        //设置图片存储路径
        form.uploadDir = "public/upImg";
        form.keepExtensions = true;   //保留后缀
        form.maxFieldsSize = 2 * 1024 * 1024; //内存大小
        form.maxFilesSize = 5 * 1024 * 1024;//文件字节大小限制，超出会报错err

        //表单解析
        form.parse(req, function (err, fields, files) {

            //获取路径
            var oldpath = files.newImg[0]['path'];

            var ext = oldpath.split('.');
            ext = ext[ext.length-1];
            var date = new Date();
            var url = 'public/upImg/' + Date.now() + '.'+ext;
            var url1 = 'upImg/' + Date.now()  + '.'+ext;
            var sql = 'UPDATE `news` SET `imgpath`=? WHERE imgpath=?';
            var parma = [url1, rs[0].imgpath];
            table(sql, parma, function (err,rs) {
                if (rs) {
                    res.json(rs);
                }
            });
            //给图片修改名称
            fs.unlink(rs[0].imgpath, function (err) {
                if (err)
                    console.log(err);
                else
                    console.log('成功')
            });
            fs.renameSync(oldpath, url);
        });
    })
});
//获取全部新闻
router.get('/getAllNews',function (req,res,next) {
    var sql = 'select * from news';
    table(sql, [], function (err,rs) {
        res.json(rs);
    });
});
//删除新闻
router.get('/delNews',function (req,res,next) {
    var id = req.query.id;
    var sql = 'select * from news where id=?';
    table(sql, [id], function (arr,rs) {
        //删除文件夹中的图片
        fs.unlink('public/'+rs[0].imgpath, function (err) {
            if (err)
                console.log(err);
            else
                console.log('删除成功');
        });
        var sql = 'DELETE FROM `news` WHERE id=?';
        table(sql,[id],function (err,rs) {
            res.json(rs.affectedRows);
        });
    });

});
//获取用户信息
router.get('/getUser',function (req,res,next) {
    var username = req.session.userInfo.username;
    var sql = 'select * from user where username=?';
    table(sql, [username], function (err,rs) {
        if (err){
            console.log(err)
        } else {
            res.json(rs);
        }

    });
});
//修改密码
router.post('/editPwd',function (req,res,next) {
    var sql = 'update user set password=? where id=?';
    table(sql, [req.body.newPassword,req.query.id], function (err,rs) {
        if (err){
            console.log(err)
        } else {
            console.log(rs)
            res.json(rs.affectedRows);
        }

    });
});

module.exports = router;
