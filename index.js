var debug = require('debug');

module.exports = function (app) {
  return new Connectr(app);
};

var merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

var stack = function(connectr) {
  var stack = connectr.stack || (connectr._router? connectr._router.stack : null);

  if (!stack) {
    stack = connectr.app.stack || (connectr.app._router? connectr.app._router.stack : null);
  }

  if (!stack) {
    throw new Error('Cannot find stack');
  }

  return stack;
};

module.exports.patch = function (app) {
  if (app._use) {
    throw new Error('This app is already patched by Connectr.');
  }

  app._use = app.use;
  app.app = app;

  app = merge(app, Connectr.prototype);

  return app;
};

var Connectr = function (app) {
  this.app = app;
};

Connectr.prototype.use = function (route, fn) {
  //this.currentFn = fn
  //
  //forward call to connect.use
  //lookup connect.stack if there is a fn with before or after properties
  //and move it at right place
  //once it is moved at right position, remove the before/after property
  //clear this.before and this.after

  if ('string' != typeof route) {
    fn = route;
  }

  // save currentFn in case there is a .as call after .use
  this.currentFn = fn;

  // save before/after as properties attached to the fn
  if (this._first)
    fn._first = true;
  if (this._before)
    fn._before = this._before;
  if (this._after)
    fn._after = this._after;

  delete this._first;
  delete this._before;
  delete this._after;

  // forward call to app.use
  if (this.app._use)
    this.app._use.apply(this.app, arguments);
  else
    this.app.use.apply(this.app, arguments);

  // lookup connect.stack if there is a fn with before or after properties
  // and move it at right place
  // @todo: optimize
  function order_stack (stack) {
    // Find a handle with a before or after property
    for (var i = 0; i < stack.length; i++) {
      var handle = stack[i].handle;
      if (handle._first) {
        // remove handle from current position
        var mid = stack.splice(i, 1)[0];
        // insert it at begining of stack
        stack.unshift(mid);

        // remove property so we don't order it again later
        delete handle._first;
        // for debugging
        handle._moved_first = true;

        // Continue ordering for remaining handles
        return order_stack (stack);
      }
      else if (handle._before || handle._after) {
        var position = null;
        if (handle._before) {
          position = '_before';
        }
        else if (handle._after) {
          position = '_after';
        }

        var label = handle[position];

        for (var j = 0; j < stack.length; j++) {
          if (stack[j].handle.label === label) {
            // insert before index = j
            // insert after index = j + 1
            var new_index = j;
            if (position == '_after') new_index++;

            // move handle in new position
            // http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
            stack.splice(new_index, 0, stack.splice(i, 1)[0]);

            // remove _before/_after property so we don't order ad infinitum
            handle['_moved' + position] = handle[position]; // for debugging
            break;
          }
        }
        delete handle[position];
        // Continue ordering for remaining handles
        return order_stack (stack);
      }
    }
    // didn't find any handle with a before/after property => done ordering
    return true;
  }

  order_stack(stack(this));

  return this;
};

/**
 * Removes middleware labeled `label`
 *
 * @param {String} label
 */
Connectr.prototype.remove = function (label) {
  for (var i = 0; i < this.stack.length; i++) {
    if (this.stack[i].handle.label === label) {
      this.stack.splice(i, 1);
    }
  }
  return this;
};

Connectr.prototype.index = function (index) {
  this.currentFn = this.stack[index].handle;
  return this;
};

Connectr.prototype.as = function (label) {
  try {
    this.currentFn.label = label;
    return this;
  }
  catch (e) {
    throw new Error('.as() must be used after a .use() call.');
  }
};

/**
 * Adds a middleware at the beginning of the stack
 */
Connectr.prototype.first = function () {
  this._first = true;
  return this;
};

Connectr.prototype.before = function (label) {
  this._before = label;
  return this;
};

Connectr.prototype.after = function (label) {
  this._after = label;
  return this;
};
