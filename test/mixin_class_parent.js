var mixin_parent = require('./mixin_parent.js');
var class_parent = require('./class_parent.js');

var mixin_class_parent = class_parent.extend(function(_super){
  this.includes = [mixin_parent];//an array can list as many mixins as desired. name conflicts might arise; TODO: implement an indexed array for renaming the respective functions and avoid naming conflicts

  this.__init = function(parent_number){
    _super.__init.call(this, parent_number);// call to parent constructor
  };
});

module.exports = mixin_class_parent;
