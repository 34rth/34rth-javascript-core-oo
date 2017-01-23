var earth = require('34rth-javascript-core-oo');

var speaker = earth.core.mixin.extend(function(_super){
  this.say_something = function(){
    console.log('something');
  };
});

//mixins can also inherit from other mixins
var hello = earth.core.mixin.extend(function(_super){
  this.say_hello = function(name){
    console.log('Hello ' + name);
  };
});

var bye = earth.core.mixin.extend(function(_super){
  this.say_goodbye = function(name){
    console.log('Bye ' + name);
  };
});

var app = earth.core.object.extend(function(_super){
  this.includes = [speaker, hello, bye];//array of mixins to include
});


var test = new app();

test.say_something();//Prints "Something"
test.say_hello('Marry');//prints "Hello Marry"
test.say_goodbye('Marry');//prints "Bye Marry"
