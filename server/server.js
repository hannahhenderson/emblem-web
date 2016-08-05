var express = require('express');
var morgan = require('morgan');
var addRouter = require('./router');
var path = require('path');
var connection = require('./db/db');
var webpackConfig = require('../client/webpack.config.js')
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
// var webpackDevMiddleWare = require('webpack-dev-middleware');
// var webpackHotMiddleWare = require('webpack-hot-middleware');

var compiler = webpack(webpackConfig);

var app = express();

var port = 3000;

app.use(morgan('dev'));

addRouter(app);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.use('/build', express.static(path.join(__dirname + '/../client/build')));
app.use('/assets', express.static(path.join(__dirname + '/../client/assets')));

app.listen(port, function(err) {
  if (err) {throw err;};
  console.log('listening on port ', port);
});
