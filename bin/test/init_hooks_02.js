var earth = require('../oo.js');

var my_class = earth.core.object.extend(function(_super){
  this.__init = function(number){
    console.log('Yaaay, the constructor was just called');
    this.number = number;
  };
});

var my_child_class = my_class.extend(function(_super){
  this.__init = function(number){
    _super.__init.call(_super, number);
  };
});

my_class.add_init_hook(function(_super){
  console.log('Class has been initialised with number ' + _super.number);
});

new my_child_class(10);
//'Yaaay, the constructor just was called
//Class has been initialised with number 10
