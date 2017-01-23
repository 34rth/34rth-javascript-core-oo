var earth = require('34rth-javascript-core-oo');

var my_class = earth.core.object.extend(function(_super){
  this.__init = function(number){
    console.log('Yaaay, the constructor just was called');
    this.number = number;
  };

  this.my_special_function = function(){
    console.log('I am ' + this.number + ' times more special than anyone else!');
  };
});

var my_child_class = my_class.extend(function(_super){
  this.__init = function(number){
    _super.__init.call(this, number);
  };
  
  this.my_special_function = function(){
    console.log('Me toooooooo!');
  };
});

my_child_class.add_init_hook(function(_super){
  console.log('Class has been initialised with number ' + this.number);
  _super.my_special_function.call(this);
  this.my_special_function();
});

new my_child_class(10);
//Yaaay, the constructor just was called
//Class has been initialised with number 10
//I am 10 times more special than anyone else!
//Me toooooooo!
