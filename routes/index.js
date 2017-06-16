var express = require('express');
var router = express.Router();

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://127.0.0.1');

var fs = require('fs');

var multer = require('multer');

var imglist = {};
var rootpath = './public/images';
var imgresolutepath, imgrelativepath;

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    imgrelativepath = new Date().Format("yyyy-MM-dd");
    imgresolutepath = rootpath + '/' + imgrelativepath;
    try{ fs.accessSync(imgresolutepath);}
    catch(e){ fs.mkdirSync(imgresolutepath);}

    cb(null, imgresolutepath)
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.png')
  }
})
var upload = multer({storage: storage});


client.on('connect', function() {
  client.subscribe('avatar/signed');

});

client.on('message', function (topic, message) {
  console.log(message.toString())
})

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('Got a get request.');
});

router.post('/', function(req, res) {
  res.send('Got a post request.');
});

Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

// var createFolder = function(folder) {
//   try{ fs.accessSync(folder);}
//   catch(e){ fs.mkdirSync(folder);}
// };

router.post('/upload', upload.array('avatar', 9), function(req, res, next) {
  imglist = {images:[]};
  // var files = fs.readdirSync(imgresolutepath);
  // for (var i in files) {
  //   var str = files[i];
  //   if(str.indexOf('avatar') === 0) {
  //     var filename = '/images/' + imgrelativepath + '/' + files[i];
  //     imglist.images.push(filename);
  //   }
  // }
  var filename = '/images/' + imgrelativepath + '/' + req.files[0].filename;
  imglist.images.push(filename);
  client.publish('avatar/uploaded', JSON.stringify(imglist, null, '   '));
  res.send('Got upload post request');
});

router.post('/signed', upload.single('signed'), function(req, res) {
  var ret = {rtn_code:'true', data:'', msg:''};
  ret.data = req.file.path;
  res.send(JSON.stringify(ret, null,''));

  // imglist = {images:{date:Date(), list:[]}};
  // var files = fs.readdirSync(rootpath);
  // for(var i in files) {
  //   var filename = '/images/' + files[i];
  //   imglist.images.list.push(filename);
  // }
  //
  // res.send(JSON.stringify(imglist, null, '   '));
});

module.exports = router;
