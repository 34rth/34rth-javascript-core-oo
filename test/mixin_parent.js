var earth = require('../bin/oo.js');

var mixin_parent = earth.core.mixin.extend(new function(){
  this.__id__ = 'earth.test.mixin.parent';

  this.statics = {};

  this.statics.parent_static_function = function(){
    return 'mixin parent static';//this should not overwrite the class static function and a warning should be thrown
  };

  this.statics.mixin_static_function = function(){
    return 'mixin static';
  };
  
  this.mixin_variable = 10;//a variable defined only in the mixin

  this.mixin_object = {//complex object for checking correct cloning when including mixins to avoid sharing the same object reference across entities
    first:1,
    second:2
  };

  this.increase_number = function(){
    this.number++;//number variable is defined in e.g. parent. if 'mixing' with a class inherited from child_class this should use the respective number instance variable. if mixed with another class that does not define the member variable, this should throw an error.
  };

  this.get_value = function(value){
    return value;
  };
  
  this.get_parent_class_value = function(){
    //this returns a value only defined in the class
    return this.parent_number;
  };
  
  this.get_child_class_value = function(){
    //this returns a value only defined in the class
    return this.child_number;
  };

});

module.exports = mixin_parent;
