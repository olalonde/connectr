var http = require('http'),
  connect = require('connect'),
  app = connect(),
  connectr = require('./')(app);

var cookieParser = connect.cookieParser();

// we need to manually label middlewares
cookieParser.label = 'cookieParser';

app.use(cookieParser);

connectr.before('cookieParser').use(function (req, res, next) {
  console.log('Middleware before cookie parser.');
  next();
});

connectr.after('cookieParser').use(function (req, res, next) {
  console.log('Middleware after cookie parser.');
  next();
});

// you can also use connectr to label your middlewares
// instead of labeling them manually as above

connectr.use(connect.bodyParser()).as('bodyParser');

connectr.use(function (req, res, next) {
  console.log('Last middleware');       
  res.end('Done!');
});

connectr.before('bodyParser').use(function (req, res, next) {
  console.log('Before body parser');
  next();
}).as('beforeBodyParser');

connectr.after('beforeBodyParser').use(function (req, res, next) {
  console.log('I should be called after beforeBodyParser but before bodyParser');
  next();
}).as('betweenBeforeBodyParserAndBodyParser');

connectr.after('bodyParser').use(function (req, res, next) {
  console.log('After body parser');
  next();
}).as('afterBodyParser');

//console.log(app.stack);

http.createServer(app).listen(3000);
