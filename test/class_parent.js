var earth = require('../bin/oo.js');

var class_parent = earth.core.object.extend(function(_super){
  this.__id__ = 'earth.test.parent';//this is optional, used for caching and debugging

  this.statics = {};
  this.statics.MY_STATIC_VARIABLE = 5;

  this.statics.set_my_static = function(number){
    this.MY_STATIC_VARIABLE = number;
  };
  
  this.statics.parent_static_function = function(){
    return 'parent static';
  };

  this.parent_number = null;
  
  this.complex_object = {
    first:'parent_first',
    second:'parent_second',
    my_complex_object_function:function(){
      return 10;
    }
  };
  
  this.__init = function(parent_number){
    this.parent_number = parent_number;
  };

  this.get_parent_number = function(){
    return this.parent_number;
  };

  this.shadowable_function = function(){
    return 'parent';
  };

  this.set_complex_object_value = function(key, val){
    this.complex_object[key] = val;
  }
},{complex_member_variables:true, super:true});

module.exports = class_parent;
