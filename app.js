var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var routes = require('./routes/index');
var trend = require('./routes/datatrend/trend');
var dataManage = require('./routes/dataManage/dataManage');
var api = require("./routes/api/apiV1");
var cookieParser = require('cookie-parser');
var compression = require('compression');
var filter = require('./routes/filter');
var sess = require('express-session');
var session = sess({
    secret: 'magustek.com',
    name: 'magustek.com', //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 30 * 60 * 1000}, //设置maxAge是30分钟，ession和相应的cookie失效过期
    resave: false,
    rolling: true,
    saveUninitialized: true
});


var app = express();
app.use(compression());
app.use(cookieParser());
app.use(session);

log4js.configure({
    appenders: [
        {type: 'console'}, //控制台输出
        {
            type: 'file', //文件输出
            filename: __dirname + '/logs/log.log',
            maxLogSize: 10 * 1024 * 1024,
            backups: 10,
            category: 'system'
        }
    ],
    replaceConsole: false
});
var systemLog = log4js.getLogger('system');
systemLog.setLevel('DEBUG');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//tp 2016年7月4日13:51:19  处理登录验证检查
app.use(filter.checkLogin);
app.use('/', routes);
app.use('/trend', trend);
app.use('/dataManage', dataManage);
app.use("api", api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
