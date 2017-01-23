var earth = require('34rth-javascript-core-oo');

var my_static_class = earth.core.object.extend(function(_super){
  this.statics = [];

  this.statics.say_hello = function(name){
    console.log('Hello ' + name);
  };
});

my_static_class.say_hello('Peter');//prints "Hello Peter"
