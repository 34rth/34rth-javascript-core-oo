var earth = require('../bin/oo.js');

var speaker = earth.core.mixin.extend(function(_super){
  this.say_something = function(){
    console.log('something');
    return this;//returns a reference to the object mixing
  };
});

//mixins can also inherit from other mixins
var speaker_with_good_memory = speaker.extend(function(_super){
  this.names = [];

  this.say_hello = function(name){
    this.names.push(name);
    console.log('Hello ' + this.names.join(', '));
    return this;//returns a reference to the object mixing
  };
});

var app = earth.core.object.extend(function(_super){
  this.includes = [speaker, speaker_with_good_memory];//array of mixins to include
});


var test = new app();
test.say_something().say_hello('Peter').say_hello('Marry').say_hello('Charly');
