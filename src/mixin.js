"use strict";
/**
  * copies all static and instance methods to the object as well as options
  * 
  */
earth.core.mixin = function () {};

earth.core.mixin.extend = function (properties) {
  console.log(properties);
  if(properties instanceof Function) properties = new properties(this.prototype);
  var new_object = function () {};


  // jshint camelcase: false
  var parent_proto = new_object.__super__ = this.prototype;
  var proto = earth.core.utils.create(parent_proto);
  
  proto.__init_hooks = [];

  proto.constructor = new_object;
  new_object.prototype = proto;

  //inherit parent's statics
  for (var i in this) {
    if (this.hasOwnProperty(i) && i !== 'prototype') {
      new_object[i] = this[i];
    }
  }
  // mix static properties into the object
  if(properties.statics) {
    earth.core.utils.extend(new_object, properties.statics);
    delete properties.statics;
  }

  // merge options
  if (proto.options) {
    properties.options = earth.core.utils.extend(earth.core.utils.create(proto.options), properties.options);
  }

  // mix given properties into the prototype
  earth.core.utils.extend(proto, properties);
  return new_object;
};

earth.core.mixin.add_init_hook = function (fn) { // (Function) || (String, args...)
  this.prototype.__init_hooks.push(fn);
};
