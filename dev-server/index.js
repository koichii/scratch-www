const express = require('express');
const bodyParser = require('body-parser');
var proxy = require('express-http-proxy');
var path = require('path');
var cookieParser = require('cookie-parser')

var webpackDevMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');

var compiler = webpack(require('../webpack.config.js'));
var handler = require('./handler');
var log = require('./log');
var routes = require('../src/routes.json').concat(require('../src/routes-dev.json'))
    .filter(route => !process.env.VIEW || process.env.VIEW === route.view);

// Create server
var app = express();
app.disable('x-powered-by');
app.use(cookieParser());

// urlencodedとjsonは別々に初期化する
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Server setup
app.use(log());
//app.use("/static/assets",log());

if (false) {
    // Bind routes
    routes.forEach(route => {
        app.get(route.pattern, handler(route));
    });
    // ただのログ
    app.use(function (req, res, next) {
        if (req.url != req.originalUrl) {
            console.log(req.originalUrl, " ==> ", req.url)
        }
        next();
    })
}

// Scratch Server APIs
app.use('/', require('./api_host.js'));
//app.use('/ASSET_HOST', proxy("https://cdn.assets.scratch.mit.edu"))

if (true) {
    // Scratch Client
    app.use('/', express.static(path.join(__dirname, '../build')));
}
else {
    var middlewareOptions = {};
    app.use(webpackDevMiddleware(compiler, middlewareOptions));
}

var proxyHost = process.env.FALLBACK || '';
if (proxyHost !== '') {
    // Fall back to scratchr2 in development
    // This proxy middleware must come last
    app.use('/', proxy(proxyHost));
}

//env ASSET_HOST=http://192.168.0.10:8333/ASSET_HOST ROOT_URL=http://192.168.0.10:8333 API_HOST=http://192.168.0.10:8333/API_HOST BACKPACK_HOST=http://192.168.0.10:8333/BACKPACK_HOST PROJECT_HOST=http://192.168.0.10:8333/PROJECT_HOST npm start

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    return next(err)
});

// error handler
app.use(function(err, req, res, next) {
    console.log("ERROR!!!!", err.message)
    res.status(err.status || 500).send(err.message);
});

// Start listening
var port = process.env.PORT || 8333;
app.listen(port, function () {
    process.stdout.write('Server listening on port ' + port + '\n');
    if (proxyHost) {
        process.stdout.write('Proxy host: ' + proxyHost + '\n');
    }
});
