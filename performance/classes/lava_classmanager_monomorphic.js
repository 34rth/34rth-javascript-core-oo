var Lava = require("lava-class-manager");

Lava.ClassManager.registerRootNamespace("global", typeof window != "undefined" ? window : global);
Lava.ClassManager.is_monomorphic = true;
Lava.ClassManager.define(
'global.base_monomorphic',
{
  counter:0,
  instance_array:[],
  instance_string:null,
  init:function(instance_string){
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
});

Lava.ClassManager.define(
'global.subclass_monomorphic_a',
{
	Extends: 'global.base_monomorphic',
  member_a:1,
  init:function(instance_string){
    this.base_monomorphic$init(instance_string);
  },
  method:function(prevent_inline){
    this.base_monomorphic$method(false);
    this.member_a = -this.member_a;
  }
});

Lava.ClassManager.define(
'global.subclass_monomorphic_b',
{
	Extends: 'global.base_monomorphic',
  member_b:1,
  init:function(instance_string){
    this.base_monomorphic$init(instance_string);
  },
  method:function(prevent_inline){
    this.base_monomorphic$method(false);
    this.member_b = -this.member_b;
  }
});


module.exports = {
  name:'Lava.ClassManager monomorphic',
  classes:{
    base:base_monomorphic,
    subclass_a:subclass_monomorphic_a,
    subclass_b:subclass_monomorphic_b
  }
};
