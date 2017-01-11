var class_parent = require('./class_parent.js');

var class_child = class_parent.extend(function(_super){
  this.__id__ = 'earth.test.child';//this is optional, used for caching and debugging

  this.statics = {};
  this.statics.set_my_static = function(number){
    class_parent.set_my_static(number);
  };
  this.statics.child_static_function = function(){
    return 'child static';
  };
  
  this.child_number = null;
  this.number = 0;//this member variable will be shared across all (inheriting) instances

  this.public_variable = 'should be seen and accessible from the outside';
  var private_variable = 'should not be seen from the outside, but can be used from anywhere within the class context';

  this.__init = function(parent_number, child_number){
    this.super(parent_number);// call to parent constructor
    this.child_number = child_number;
  };

  this.get_child_number = function(){
    return this.child_number;
  };

  this.shadowable_function = function(concatenate){
    var test = ((concatenate)?this.super():'') + 'child';
    return test;
  };

  this.set_complex_object_value_child = function(key, val){
    class_parent.prototype.set_complex_object_value.call(this, key, val);
  };
},{complex_member_variables:true, super:true});

module.exports = class_child;
