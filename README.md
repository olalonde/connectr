# Connectr for Connect (Node.js)

Connectr complements Connect by allowing the insertion of middleware
before or after middlewares that already part of the stack.

# Usage 

```javascript 
var connect = require('connect'),
  app = connect(),
  connectr = require('connectr')(app);

var cookieParser = connect.cookieParser();

// we need to manually label middlewares
cookieParser.label = 'cookieParser';

app.use(cookieParser);

connectr.before('cookieParser').use(function (req, res, next) {
  console.log('Middleware before cookie parser.');
});

connectr.after('cookieParser').use(function (req, res, next) {
  console.log('Middleware after cookie parser.');
});

// you can also use connectr to label your middlewares
// instead of labeling them manually as above

connectr.use(connect.bodyParser).as('bodyParser');

connectr.after('bodyParser').use(function () {
  console.log('Before body parser');
}).as('beforeBodyParser');

connectr.after('beforeBodyParser').use(function () {
  console.log('I should be called after beforeBodyParser but before bodyParser');
}).as('betweenBeforeBodyParserAndBodyParser');

http.createServer(app).listen(3000);
```

