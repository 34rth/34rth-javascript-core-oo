var class_child = require('./class_child.js');

var class_othergrandchild = class_child.extend(function(_super){
  this.__id__ = 'earth.test.othergrandchild';

  this.othergrandchild_number = null;

  this.__init = function(parent_number, child_number, grandchild_number){
    _super.__init.call(this, parent_number, child_number);
    this.othergrandchild_number = grandchild_number;
  }

  this.get_grandchild_number = function(){
    return this.othergrandchild_number;
  };
});

module.exports = class_othergrandchild;
