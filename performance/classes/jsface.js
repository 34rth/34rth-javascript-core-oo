var jsface = require("jsface"),
      Class  = jsface.Class,
      extend = jsface.extend;

var base = Class({
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
  },
  $static:{
    static_property:'static',
    get_static_property:function(){
      return this.static_property;
    }
  }
});

var subclass_a = Class(base, {
  member_a:1,
  constructor:function(instance_string){
    subclass_a.$super.call(this, instance_string);
  },
  method:function(prevent_inline) {
    subclass_a.$superp.method.call(this, false);
    this.member_a = -this.member_a;
  },
  $static:{
    get_static_property:function(){
      return base.get_static_property() + 'A';
    }
  }
});

var subclass_b = Class(base, {
  member_b:1,
  constructor:function(instance_string){
    subclass_b.$super.call(this, instance_string);
  },
  method:function(prevent_inline) {
    subclass_b.$superp.method.call(this, false);
    this.member_b = -this.member_b;
  },
  $static:{
    get_static_property:function(){
      return base.get_static_property() + 'B';
    }
  }
});

var subsubclass_a = Class(subclass_a, {
  constructor:function(instance_string){
    subsubclass_a.$super.call(this, instance_string);
  }
})

var subsubclass_b = Class(subclass_b, {
  constructor:function(instance_string){
    subsubclass_b.$super.call(this, instance_string);
  }
})

module.exports = {
  name:'jsface',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b,
    subsubclass_a:subsubclass_a,
    subsubclass_b:subsubclass_b
  }
};
