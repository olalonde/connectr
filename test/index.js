var connect = require('connect'),
  http = require('http');

var static = connect.static('public');
static.label = 'static';

var app = require('../').patch(connect());

var cookieParser = connect.cookieParser();
cookieParser.label = 'cookieParser';

app.use(connect.favicon())
  .use(static);

app.use(connect.bodyParser).as('bodyParser')
  .use(connect.directory('public')).as('directory')
  .use(cookieParser)
  .use(connect.session({ secret: 'my secret here' }));

app.use(function(req, res){
    res.end('Hello from Connect!\n');
  });


//app.use(connect.bodyParser).as('bodyParser');
// use `as` only if connect.bodyParser doesn't have a label property

//connect.use(connect.bodyParser);

app.before('static').use(function (req, res, next) {
  console.log('before static');
});

app.before('cookieParser').use(function (req, res, next) {
  console.log('before cookieParser');
});

//app.before('static').use(function (req, res, next) {
  //console.log('before static');
//});

app.after('static').use(function (req, res, next) {
  console.log('after static');
});

console.log(app.stack);
//app.after('bodyParser').use(function () {

//}).as('movefile-to-s3');

// app inserts at the right place in the stack
// functions have a label property
// it looks for function with the right label and inserts before
// or after

http.createServer(app).listen(3000);
