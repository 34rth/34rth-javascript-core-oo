var Lava = require("lava-class-manager");

Lava.ClassManager.registerRootNamespace("global", typeof window != "undefined" ? window : global);
Lava.ClassManager.is_monomorphic = false;
Lava.ClassManager.define(
'global.base_polymorphic',
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
'global.subclass_polymorphic_a',
{
	Extends: 'global.base_polymorphic',
  member_a:1,
  init:function(instance_string){
    this.base_polymorphic$init(instance_string);
  },
  method:function(prevent_inline){
    this.base_polymorphic$method(false);
    this.member_a = -this.member_a;
  }
});

Lava.ClassManager.define(
'global.subclass_polymorphic_b',
{
	Extends: 'global.base_polymorphic',
  member_b:1,
  init:function(instance_string){
    this.base_polymorphic$init(instance_string);
    this.member_b = 1;
  },
  method:function(prevent_inline){
    this.base_polymorphic$method(false);
    this.member_b = -this.member_b;
  }
});

Lava.ClassManager.define(
'global.subsubclass_polymorphic_a',
{
	Extends: 'global.subclass_polymorphic_a',
  init:function(instance_string){
    this.subclass_polymorphic_a$init(instance_string);
  }
});
Lava.ClassManager.define(
'global.subsubclass_polymorphic_b',
{
	Extends: 'global.subclass_polymorphic_b',
  init:function(instance_string){
    this.subclass_polymorphic_b$init(instance_string);
  }
});


module.exports = {
  name:'Lava.ClassManager polymorphic',
  classes:{
    base:base_polymorphic,
    subclass_a:subclass_polymorphic_a,
    subclass_b:subclass_polymorphic_b,
    subsubclass_a:subsubclass_polymorphic_a,
    subsubclass_b:subsubclass_polymorphic_b
  }
};
