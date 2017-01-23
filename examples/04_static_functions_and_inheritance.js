var earth = require('34rth-javascript-core-oo');

var my_parent_static_class = earth.core.object.extend(function(_super){
  this.statics = [];

  this.statics.say_hello = function(name){
    console.log('Hello ' + name);
  };
});

var my_child_static_class = my_parent_static_class.extend(function(_super){
  this.statics = [];

  this.statics.say_bye = function(name){
    console.log('Bye ' + name);
  };
});

my_child_static_class.say_hello('Marry');//prints "Hello Marry"
my_child_static_class.say_bye('Peter');//prints "Bye Peter"
my_parent_static_class.say_hello('Peter');//print "Hello Peter"
try{
  my_parent_static_class.say_bye('Marry');//is not defined and throws an Exception
}catch(e){
  console.log('I am not defined');
}
