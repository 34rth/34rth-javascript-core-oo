var earth = require('./bin/oo.js');

var class_34rth = earth.core.object.extend(new function(){
  this.__id__ = 'class_34rth';
  this.first = 1;
  this.second= 2;

  this.statics = {};
  this.statics.MY_OBJECT = {};

  this.__init = function(){};

  this.my_function = function(){
    console.log('34rth class test');
  };
});

var subclass_34rth = class_34rth.extend(new function(){
  this.__id__ = 'subclass_34rth';
  this.third = 3;
  this.fourth = 4;
  this.fifth = 5;

  this.__init = function(){};

  this.my_function = function(){
    console.log('34rth subclass test - shadowed by subclass');
  };

  this.another_function = function(){
    console.log('34rth subclass test - yet another function');
  };
});

var subsubclass_34rth = subclass_34rth.extend(new function(){
  this.__id__ = 'subsubclass_34rth';
  this.sixth = 6
  this.seventh = 7;

  this.__init = function(){};
  
  this.another_function = function(){
    console.log('34rth subsubclass test - yet another function shadowed');
  };
});

var subsubsubclass_34rth = subsubclass_34rth.extend(new function(){
  this.__id__ = 'subsubsubclass_34rth';
  this.eighth = 8;
  
  this.__init = function(){};
  
  this.yet_another_function = function(){
    console.log('34rth subsubclass test - yet another function shadowed');
  };
});

var class_34rth_complex = earth.core.object.extend(new function(){
  this.__id__ = 'class_34rth_complex';
  this.first = {
    one:1
  };
  this.second= {
    two:2
  };

  this.statics = {};
  this.statics.MY_OBJECT = {};

  this.__init = function(){};

  this.my_function = function(){
    console.log('34rth_complex class test');
  };
}, true);

var subclass_34rth_complex = class_34rth_complex.extend(new function(){
  this.__id__ = 'subclass_34rth_complex';
  this.third = {
    three:3
  };
  this.fourth = {
    four:4
  };
  this.fifth = {
    five:5
  };

  this.__init = function(){};

  this.my_function = function(){
    console.log('34rth_complex subclass test - shadowed by subclass');
  };

  this.another_function = function(){
    console.log('34rth_complex subclass test - yet another function');
  };
}, true);

var subsubclass_34rth_complex = subclass_34rth_complex.extend(new function(){
  this.__id__ = 'subsubclass_34rth_complex';
  this.sixth = {
    six:6
  };
  this.seventh = {
    seven:7,
    my_function:function(){
      console.log('Bob Ross draws happy little squirrels, seventh has a happy little function...');
    }
  };

  this.__init = function(){};
  
  this.another_function = function(){
    console.log('34rth_complex subsubclass test - yet another function shadowed');
  };
}, true);

var subsubsubclass_34rth_complex = subsubclass_34rth_complex.extend(new function(){
  this.__id__ = 'subsubsubclass_34rth_complex';
  this.eighth = {};
  
  this.__init = function(){};
  
  this.yet_another_function = function(){
    console.log('34rth_complex subsubclass test - yet another function shadowed');
  };
}, true);

var class_function = function(){
  this.first = 1;
  this.second =2;
  this.statics = {};
  this.statics.MY_OBJECT = {};
  this.my_function = function(){
    console.log('function class test');
  };
};

function Test(){
  this.first = 1;
  this.second =2;
  this.statics = {};
  this.statics.MY_OBJECT = {};
}

Test.prototype.my_function = function(){
  console.log('Object.create test');
};

Number.prototype.format = function(n, x) {
      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
      return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

var timer = earth.core.object.extend(new function(){
  this.timers = null;
  this.last_time = null;

  this.__init = function(){
    this.timers = [];
  };

  this.start = function(){
    this.timers.push(new Date());
  };

  this.stop = function(){
    var start = this.timers.pop();
    this.last_time = (new Date()) - start;
    return this.last_time;
  };

  this.get_last_time = function(){
    returnt this.last_time;
  };
});

timer = new timer();

var instance = null;
var iterations = 10*1000*1000;
var iterations_readable = iterations.format();

var timings = [];

timer.start();
  console.log(timer.stop());
},1300);

return;

console.log('===================== native javascript object instantiation ======================');
console.log('creating ' + iterations_readable + ' objects by literals'); 
console.time('literal-object');
for(var i = 0;i<iterations;i++){
  instance = {
    __id__ : 'class_34rth',
    first : 1,
    second: 2,
    statics : {},
    MY_OBJECT : {},
    my_function : function(){
      console.log('34rth class test');
    }
  }
}
console.timeEnd('literal-object');

console.log('creating '+iterations_readable+' "Object.create()"');
console.time('object');
for(var i = 0;i<iterations;i++){
  instance = Object.create(Test.prototype);
}
console.timeEnd('object');

console.log('creating '+iterations_readable+' arrays by literals'); 
console.time('literal-array');
for(var i = 0;i<iterations;i++){
  instance = [];
}
console.timeEnd('literal-array');

console.log('creating '+iterations_readable+' "new Array()"');
console.time('array');
for(var i = 0;i<iterations;i++){
  instance = new Array();
}
console.timeEnd('array');

console.log('creating '+iterations_readable+' function class instances'); 
console.time('literal');
for(var i = 0;i<iterations;i++){
  instance = new class_function();
}
console.timeEnd('literal');

console.log('===================== 34rth framework non complex object inheritance levels ======================');

console.log('34rth framework creating '+iterations_readable+' new class instances');
console.time('earth-complex-depth-0');
for(var i = 0;i<iterations;i++){
  instance = new class_34rth();
}
console.timeEnd('earth-complex-depth-0');


console.log('34rth framework creating '+iterations_readable+' new subclass instances');
console.time('earth-complex-depth-1');
for(var i = 0;i<iterations;i++){
  instance = new subclass_34rth();
}
console.timeEnd('earth-complex-depth-1');

console.log('34rth framework creating '+iterations_readable+' new subsubclass instances');
console.time('earth-complex-depth-2');
for(var i = 0;i<iterations;i++){
  instance = new subsubclass_34rth();
}
console.timeEnd('earth-complex-depth-2');

console.log('34rth framework creating '+iterations_readable+' new subsubsubclass instances');
console.time('earth-complex-depth-3');
for(var i = 0;i<iterations;i++){
  instance = new subsubsubclass_34rth();
}
console.timeEnd('earth-complex-depth-3');

console.log('===================== 34rth framework complex object inheritance levels (this might take a while) ======================');

console.log('34rth framework creating '+iterations_readable+' new complex member class instances');
console.time('earth-complex-depth-0');
for(var i = 0;i<iterations;i++){
  instance = new class_34rth_complex();
}
console.timeEnd('earth-complex-depth-0');


console.log('34rth framework creating '+iterations_readable+' new complex member subclass instances');
console.time('earth-complex-depth-1');
for(var i = 0;i<iterations;i++){
  instance = new subclass_34rth_complex();
}
console.timeEnd('earth-complex-depth-1');

console.log('34rth framework creating '+iterations_readable+' new complex member subsubclass instances');
console.time('earth-complex-depth-2');
for(var i = 0;i<iterations;i++){
  instance = new subsubclass_34rth_complex();
}
console.timeEnd('earth-complex-depth-2');

console.log('34rth framework creating '+iterations_readable+' new complex member subsubsubclass instances');
console.time('earth-complex-depth-3');
for(var i = 0;i<iterations;i++){
  instance = new subsubsubclass_34rth_complex();
}
console.timeEnd('earth-complex-depth-3');
