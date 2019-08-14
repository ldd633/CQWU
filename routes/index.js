var express = require('express');
var router = express.Router();
var table = require('../modules/optdb');
/* GET home page. */
router.get('/', function(req, res, next) {
  var sql = 'select * from news order by id desc limit 3';
  table(sql,[],function (err,rs) {
    if (err){
      console.log(err);
    } else {
      res.render('index', { arr: rs });
    }
  });

});

module.exports = router;
