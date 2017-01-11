var inherit = require('inherit');

var base = inherit({
  counter:0,
  instance_array:[],
  instance_string:null,

  __constructor:function(instance_string){
    this.instance_string = instance_string;
  },
  method:function(prevent_inline){
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
},{
  static_property:'static',
  get_static_property:function(){
    return this.static_property;
  }
});

var subclass_a = inherit(base, {
  member_a:1,
  __constructor:function(instance_string){
    base.prototype.__constructor.call(this, instance_string);
  },
  method:function(prevent_inline){
    base.prototype.method.call(this, false);
    this.member_a = -this.member_a;
  }
},{
  get_static_property:function(){
    return base.get_static_property() + 'A';
  }
});

var subclass_b = inherit(base, {
  member_b:1,
  __constructor:function(instance_string){
    base.prototype.__constructor.call(this, instance_string);
  },
  method:function(prevent_inline){
    base.prototype.method.call(this, false);
    this.member_b = -this.member_b;
  }
},{
  get_static_property:function(){
    return base.get_static_property() + 'A';
  }
});

var subsubclass_a = inherit(subclass_a, {
  __constructor:function(instance_string){
    subclass_a.prototype.__constructor.call(this, instance_string);
  }
});

var subsubclass_b = inherit(subclass_b, {
  __constructor:function(instance_string){
    subclass_b.prototype.__constructor.call(this, instance_string);
  }
});

module.exports = {
  name:'inherits',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b,
    subsubclass_a:subsubclass_a,
    subsubclass_b:subsubclass_b
  }
};
