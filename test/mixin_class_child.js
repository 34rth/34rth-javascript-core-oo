var mixin_parent = require('./mixin_parent.js');
var class_child = require('./class_child.js');

var mixin_class_child = class_child.extend(function(_super){
  this.includes = [mixin_parent];//an array can list as many mixins as desired. name conflicts might arise; TODO: implement an indexed array for renaming the respective functions and avoid naming conflicts

  this.__init = function(parent_number, child_number){
    class_child.prototype.__init.call(this, parent_number, child_number);
  };
},true);

module.exports = mixin_class_child;
