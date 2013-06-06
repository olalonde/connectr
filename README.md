# Connectr for [Connect](https://github.com/senchalabs/connect) (Node.js)

Connectr is a layer on top of [Connect](https://github.com/senchalabs/connect) that allows the insertion/removal of middlewares
after the stack has been built.

# Install

    npm install connectr

# Usage

```javascript
var connectr = require('connectr')(app);

// Add labeled middleware
connectr.use(middleware).as(label);

// Insert before middleware
connectr.before(label).use(middleware).as(label);

// Insert after middleware
connectr.after(label).use(middleware);

// Insert at beginning of stack
connectr.first().use(middleware);

// Remove middleware
connectr.remove(label);

// Assign a label to middleware already in the stack
connectr.index(i).as(label);

// the .as, .before and .after calls are optional

// have a problem? try console.log(app.stack)
```

# Simple Example

```javascript
var connect = require('connect'),
var app = connect();
var connectr = require('connectr')(app);

connectr.use(connect.cookieParser).as('cookieParser');

/* ... */

connectr.before('cookieParser').use(function (req, res, next) {
  console.log('Before cookie parser...');
  next();
}).as('log before cookie parser');

```

# Kitchen Sink Example 

```javascript 
var http = require('http'),
  connect = require('connect'),
  app = connect(),
  connectr = require('connectr')(app);

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
```

