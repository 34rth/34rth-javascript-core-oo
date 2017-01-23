var earth = require('34rth-javascript-core-oo');

var my_class = earth.core.object.extend(function(_super){
  this.__id__ = 'my_class'; //this is optional for debugging purpose; definition does not have to be included
  
  this.statics = {};//define the statics object:
  this.statics.my_static_function = function(){
    console.log('Hooray, I\'m static');
  };

  this.statics.my_other_static_function = function(){
    console.log('So what, so am I...');
  };

  this.statics.STATIC_VALUE = 'I am like a rock...';

  this.member_variable = 'I am a variable and can be accessed from any instance';

  var private_variable = 'I am shy';

  //I am the constructor, all your base are belong to us
  this.__init = function(a, b, c){
    console.log('Constructing is as easy as ' + a + ' ' + b + ' ' + c);
  };

  this.public_function = function(){
    console.log('total extrovert');
  };

  var private_function = function(){
    console.log('not really introvert, but do not really fancy being seen everywhere, anytime...');
  };
});

//testing the statics
my_class.my_static_function();
my_class.my_other_static_function();
console.log(my_class.STATIC_VALUE);

var my_instance = new my_class(1,2,3);
my_instance.public_function();
try{
  my_instance.private_function();
}catch(e){
  console.log('really, really, really don\'t want to be called');
}
console.log(my_instance.member_variable);
console.log(my_instance.private_variable);//undefined... they said they're shy :) 
