var class_child = require('./class_child.js');

var class_grandchild = class_child.extend(function(_super){
  this.__id__ = 'earth.test.grandchild';

  this.grandchild_number = null;

  this.__init = function(parent_number, child_number, grandchild_number){
    class_child.prototype.__init.call(this, parent_number, child_number);
    this.grandchild_number = grandchild_number;
  }

  this.get_grandchild_number = function(){
    return this.grandchild_number;
  };
},true);

module.exports = class_grandchild;
