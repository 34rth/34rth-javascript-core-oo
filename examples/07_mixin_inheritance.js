var earth = require('34rth-javascript-core-oo');

var speaker = earth.core.mixin.extend(function(_super){
  this.say_something = function(){
    console.log('something');
  };
});

//mixins can also inherit from other mixins
var speaker_with_good_memory = speaker.extend(function(_super){
  this.names = [];

  this.say_hello = function(name){
    this.names.push(name);
    console.log('Hello ' + this.names.join(', '));
  };
});

var app = earth.core.object.extend(function(_super){
  this.includes = [speaker, speaker_with_good_memory];//array of mixins to include
});


var test = new app();

test.say_something();//Prints "Something"
test.say_hello('Peter');//prints "Hello Peter"
test.say_hello('Marry');//prints "Hello Peter, Marry"
test.say_hello('Charly');//prints "Hello Peter, Marry, Charly"
