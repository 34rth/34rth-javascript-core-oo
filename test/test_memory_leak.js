//requiring the test classes
var class_parent = require('./class_parent.js');
var class_child = require('./class_child.js');
var class_grandchild = require('./class_grandchild.js');

for(var i = 0;i<1000000;i++){
  var g = new class_child(i, i+1, i+4);
}

console.log('done');
