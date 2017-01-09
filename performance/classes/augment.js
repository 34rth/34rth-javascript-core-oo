var augment = require("augment");

var base = augment.defclass({
  instance_string : null,
  counter : 0,
  instance_array : [],
  constructor:function(instance_string){
    this.instance_string = instance_string;
  },
  method:function(prevent_inline) {
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
  }
});

var subclass_a = augment(base, function(uber){
  this.member_a = 1;
  this.constructor = function(instance_string){
    uber.constructor.call(this, instance_string);
  };
  
  this.method = function(prevent_inline) {
    uber.method.call(this, false);
    this.member_a = -this.member_a;
  };
});

var subclass_b = augment(base, function(uber){
  this.member_b = 1;
  this.constructor = function(instance_string){
    uber.constructor.call(this, instance_string);
  };
  
  this.method = function(prevent_inline) {
    uber.method.call(this, false);
    this.member_b = -this.member_b;
  };
});

var subsubclass_a = augment(subclass_a, function(uber){
  this.method = function(prevent_inline) {
    uber.method.call(this, false);
  };
});
var subsubclass_b = augment(subclass_b, function(uber){
  this.method = function(prevent_inline) {
    uber.method.call(this, false);
  };
});

module.exports = {
  name:'augment',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b
  }
};
