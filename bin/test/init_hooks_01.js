var earth = require('../oo.js');

var my_class = earth.core.object.extend(function(_super){
  this.__init = function(number){
    console.log('Yaaay, the constructor was just called');
    this.number = number;
  }
});

my_class.add_init_hook(function(_super){
  console.log('Class has been initialised with number ' + this.number);
});

new my_class(10);
//'Yaaay, the constructor was just called
//Class has been initialised with number 10
