"use strict";

earth.core.mixin.observable = earth.core.mixin.extend(new function(){
  this.__id__ = 'earth.core.mixin.observable';

  this.on = function (types, fn, context) {
    // types can be a map of types/handlers
    if (typeof types === 'object') {
      for (var type in types) {
        // we don't process space-separated events here for performance;
        // it's a hot path since Layer uses the on(obj) syntax
        this._on(type, types[type], fn);
      }
    } else {
      // types can be a string of space-separated words
      types = earth.core.utils.split_words(types);

      for (var i = 0, len = types.length; i < len; i++) {
        this._on(types[i], fn, context);
      }
    }

    return this;
  };

  this.off = function (types, fn, context) {
    if (!types) {
      // clear all listeners if called without arguments
      delete this._events;
    } else if (typeof types === 'object') {
      for (var type in types) {
        this._off(type, types[type], fn);
      }
    } else {
      types = earth.core.utils.split_words(types);

      for (var i = 0, len = types.length; i < len; i++) {
        this._off(types[i], fn, context);
      }
    }

    return this;
  };

  // attach listener (without syntactic sugar now)
  this._on = function (type, fn, context) {
    var events = this._events = this._events || {},
        context_id = context && context !== this && earth.stamp(context);

    if (context_id) {
      // store listeners with custom context in a separate hash (if it has an id);
      // gives a major performance boost when firing and removing events (e.g. on map object)

      var index_key = type + '_idx',
          index_len_key = type + '_len',
          type_index = events[index_key] = events[index_key] || {},
          id = earth.stamp(fn) + '_' + context_id;

      if (!type_index[id]) {
        type_index[id] = {fn: fn, ctx: context};

        // keep track of the number of keys in the index to quickly check if it's empty
        events[index_len_key] = (events[index_len_key] || 0) + 1;
      }

    } else {
      // individual layers mostly use "this" for context and don't fire listeners too often
      // so simple array makes the memory footprint better while not degrading performance

      events[type] = events[type] || [];
      events[type].push({fn: fn});
    }
  };

  this._off = function (type, fn, context) {
    var events = this._events,
        index_key = type + '_idx',
        index_len_key = type + '_len';

    if (!events) { return; }

    if (!fn) {
      // clear all listeners for a type if function isn't specified
      delete events[type];
      delete events[index_key];
      delete events[index_len_key];
      return;
    }

    var context_id = context && context !== this && earth.stamp(context),
        listeners, i, len, listener, id;

    if (context_id) {
      id = earth.stamp(fn) + '_' + context_id;
      listeners = events[index_key];

      if (listeners && listeners[id]) {
        listener = listeners[id];
        delete listeners[id];
        events[index_len_key]--;
      }

    } else {
      listeners = events[type];

      if (listeners) {
        for (i = 0, len = listeners.length; i < len; i++) {
          if (listeners[i].fn === fn) {
            listener = listeners[i];
            listeners.splice(i, 1);
            break;
          }
        }
      }
    }

    // set the removed listener to noop so that's not called if remove happens in fire
    if (listener) {
      listener.fn = earth.core.utils.false_function;
    }
  };

  this.fire = function (type, data, propagate) {

    if (!this.listens(type, propagate)) { return this; }

    var event = earth.core.utils.extend({}, data, {type: type, target: this}),
        events = this._events;

    if (events) {
        var type_index = events[type + '_idx'],
            i, len, listeners, id;

      if (events[type]) {
        // make sure adding/removing listeners inside other listeners won't cause infinite loop
        listeners = events[type].slice();

        for (i = 0, len = listeners.length; i < len; i++) {
          listeners[i].fn.call(this, event);
        }
      }

      // fire event for the context-indexed listeners as well
      for (id in type_index) {
        type_index[id].fn.call(type_index[id].ctx, event);
      }
    }

    if (propagate) {
      // propagate the event to parents (set with add_event_parent)
      this._propagate_event(event);
    }

    return this;
  };

  this.listens = function (type, propagate) {
    var events = this._events;

    if (events && (events[type] || events[type + '_len'])) { return true; }

    if (propagate) {
      // also check parents for listeners if event propagates
      for (var id in this._event_parents) {
        if (this._event_parents[id].listens(type, propagate)) { return true; }
      }
    }
    return false;
  };

  this.once = function (types, fn, context) {
    if (typeof types === 'object') {
      for (var type in types) {
        this.once(type, types[type], fn);
      }
      return this;
    }
    var handler = earth.bind(function () {
      this
          .off(types, fn, context)
          .off(types, handler, context);
    }, this);

    // add a listener that's executed once and removed after that
    return this
        .on(types, fn, context)
        .on(types, handler, context);
  };

  // adds a parent to propagate events to (when you fire with true as a 3rd argument)
  this.add_event_parent = function (obj) {
    this._event_parents = this._event_parents || {};
    this._event_parents[earth.stamp(obj)] = obj;
    return this;
  };

  this.remove_event_parent = function (obj) {
    if (this._event_parents) {
      delete this._event_parents[earth.stamp(obj)];
    }
    return this;
  };

  this._propagate_event= function (e) {
    for (var id in this._event_parents) {
      this._event_parents[id].fire(e.type, e, true);
    }
  };
});
