var FACTORY = function () {};
var SLICE = Array.prototype.slice;
var earth = function(){};

earth.extend = function(body){
  var uber = FACTORY.prototype = typeof this === "function" ? this.prototype : this;
  var prototype = new FACTORY, skeleton = body.apply(prototype, SLICE.call(arguments, 2).concat(uber));
  if (typeof skeleton === "object") for (var key in skeleton) prototype[key] = skeleton[key];
  var derivative = function(){
    this.constructor.apply(this, arguments);
  };
  derivative.prototype = prototype;
  
  //copy static values
  for(var key in this) if(!derivative.hasOwnProperty(key)) derivative[key] = this[key];
  return derivative;
};

var b = earth.extend(function(uber){
  this.constructor = function(a){
    this.a = a;
  };

  this.emit = function(){
    console.log('ok - b');
  };
});
var c = b.extend(function(uber){
  this.emit = function(){
    uber.emit.call(this);
    console.log('ok - b');
  };
});
var d = c.extend(function(uber){
  this.constructor = function(a){
    uber.constructor.call(this, a);
  };
  this.emit = function(){
    uber.emit.call(this);
    console.log('ok - b');
  };
});

var d = new d(5);
d.emit();

console.log(d.a);
