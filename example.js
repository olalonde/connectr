var connect = require('connect'),
  http = require('http');

var static = connect.static('public');
static.label = 'static';

var cookieParser = connect.cookieParser();
cookieParser.label = 'cookieParser';

var app = connect()
  .use(connect.favicon())
  .use(connect.logger('dev'))
  .use(static)
  .use(connect.directory('public'))
  .use(cookieParser)
  .use(connect.session({ secret: 'my secret here' }))
  .use(function(req, res){
    res.end('Hello from Connect!\n');
  });

var connectr = require('./')(app);

//connectr.use(connect.bodyParser).as('bodyParser');
// use `as` only if connect.bodyParser doesn't have a label property

//connect.use(connect.bodyParser);

connectr.before('static').use(function (req, res, next) {
  console.log('before static');
});

connectr.before('cookieParser').use(function (req, res, next) {
  console.log('before cookieParser');
});

//connectr.before('static').use(function (req, res, next) {
  //console.log('before static');
//});

connectr.after('static').use(function (req, res, next) {
  console.log('after static');
});

console.log(app.stack);
//connectr.after('bodyParser').use(function () {

//}).as('movefile-to-s3');

// connectr inserts at the right place in the stack
// functions have a label property
// it looks for function with the right label and inserts before
// or after

http.createServer(app).listen(3000);
