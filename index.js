var debug = require('debug');

module.exports = function (app) {
  return new Connectr(app);
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
  if (this._before)
    fn._before = this._before;
  if (this._after)
    fn._after = this._after;

  delete this._before;
  delete this._after;

  // forward call to app.use
  this.app.use.apply(this.app, arguments);


  // lookup connect.stack if there is a fn with before or after properties
  // and move it at right place
  // @todo: optimize
  function order_stack (stack) {
    // Find a handle with a before or after property
    for (var i = 0; i < stack.length; i++) {
      var handle = stack[i].handle;
      if (handle._before || handle._after) {
        if (handle._before) {
          var position = '_before';
        }
        else if (handle._after) {
          var position = '_after';
        }

        var label = handle[position];
        //console.log(label);

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

  order_stack(this.app.stack);

  return this;
};

Connectr.prototype.as = function (label) {
  try {
    this.currentFn.label = label;
    return this;
  }
  catch (e) {
    throw new Error('.as() must be used after the .use() call.');
  }
};

Connectr.prototype.before = function (label) {
  this._before = label;
  return this;
};

Connectr.prototype.after = function (label) {
  this._after = label;
  return this;
};
