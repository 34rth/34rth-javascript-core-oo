"use strict";
/**
  * copies all static and instance methods to the object as well as options
  * 
  */
earth.core.mixin = function () {};

earth.core.mixin.extend = function (skeleton) {
  if(skeleton instanceof Function) skeleton = new skeleton(this.prototype);
  var new_object = function () {};


  // jshint camelcase: false
  var parent_proto = this.prototype;
  var proto = earth.core.utils.create(parent_proto);
  
  proto.constructor = new_object;
  new_object.prototype = proto;

  //inherit parent's statics
  for (var i in this) {
    if (this.hasOwnProperty(i) && i !== 'prototype') {
      new_object[i] = this[i];
    }
  }
  // mix static skeleton into the object
  if(skeleton.statics) {
    earth.core.utils.extend(new_object, skeleton.statics);
    delete skeleton.statics;
  }

  // merge options
  if (proto.options) {
    new_object.options = earth.core.utils.extend(earth.core.utils.create(proto.options), skeleton.options);
  }

  // mix given skeleton into the prototype
  earth.core.utils.extend(proto, skeleton);
  return new_object;
};

earth.core.mixin.add_init_hook = function (fn) { // (Function) || (String, args...)
  this.prototype.__init_hooks__ = this.prototype.__init_hooks__ || [];
  this.prototype.__init_hooks__.push(fn);
};
