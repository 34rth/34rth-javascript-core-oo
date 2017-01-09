var earth = require('../../bin/oo.js');

var base = earth.core.object.extend(function() {
  this.instance_string = null;
  this.counter = 0;
  this.instance_array = [];
  this.statics = {};
  this.statics.static_property = 'static';

  this.statics.get_static_property = function(){
    return this.static_property;
  };

  this.__init = function(instance_string) {
    this.instance_string = instance_string;
  };

  this.method = function(prevent_inline) {
    if (this.counter > 99 ) this.counter = this.counter / 2;
    else this.counter++;
    if (prevent_inline) {
      var i = 0;
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
      for (i = 0; i < 1; i++) dummy.method();
    }
  };
}, false);

var subclass_a = base.extend(function() {
  this.member_a = 1;
  
  this.statics = {};
  this.statics.get_static_property = function(){
    return base.get_static_property() + 'A';
  };
  
  this.__init = function(instance_string) {
    base.prototype.__init.call(this, instance_string);
  };

  this.method = function(prevent_inline) {
    base.prototype.method.call(this, false);
    this.member_a = -this.member_a;
  };
}, false);

var subclass_b = base.extend(function() {
  this.member_b = 1;
  
  this.statics = {};
  this.statics.get_static_property = function(){
    return base.get_static_property() + 'B';
  };

  this.__init = function(instance_string) {
    base.prototype.__init.call(this, instance_string);
  };
  
  this.method = function(prevent_inline) {
    base.prototype.method.call(this, false);
    this.member_b = -this.member_b;
  };
}, false);

var subsubclass_a = subclass_a.extend(function(){
  this.method = function(prevent_inline) {
    base.prototype.method.call(this, false);
  };
}, false)

var subsubclass_b = subclass_b.extend(function(){
  this.method = function(prevent_inline) {
    base.prototype.method.call(this, false);
  };
}, false)

module.exports = {
  name:'34rth',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b
  }
};
