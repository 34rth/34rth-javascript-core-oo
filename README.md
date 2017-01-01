[![Build Status](https://travis-ci.org/34rth/34rth-javascript-core-oo.svg?branch=master)](https://travis-ci.org/34rth/34rth-javascript-core-oo)
[![npm](http://img.shields.io/npm/v/34rth-javascript-core-oo.svg?style=flat-square)](https://www.npmjs.org/package/34rth-javascript-core-oo)
[![npm](https://img.shields.io/npm/l/34rth-javascript-core-oo.svg)]()

# General
JavaScript (node.js/browser) library for inheritance and mixins in JavaScript with strong coupling of contexts. Includes private/public/static members/functions as well as mixin architecture (borrowing functionality from mixins);

# Installation
## in Node.js
```
npm install 34rth-javascript-core-oo
```
## in Browser
Download the [/bin/oo.js](https://raw.githubusercontent.com/34rth/34rth-javascript-core-oo/master/bin/oo.js) file from github

```html
<script type="text/javascript" src="oo.js"></script>
```
# Examples 
## Classes
The example below shows the private, public functions/members, static functions and variables as well as the constructor.
```javascript
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

```

## Simple class inheritance and _super
Code example for simple inheritance calling _super constructor and methods.
```javascript
var earth = require('34rth-javascript-core-oo');

//definition of bicycle class - extending from the core class
var bicycle = earth.core.object.extend(new function(){
  this.__id__ = 'bicycle';//this is optional for debugging purposes and can be any random string

  // the bicycle class has three public member variables
  this.cadence = null;
  this.gear = null;
  this.speed = null;

  //constructor function
  this.__init = function(start_cadence, start_speed, start_gear){
    this.gear = start_gear;
    this.speed = start_speed;
    this.cadence = start_cadence;
  };

  this.set_cadence = function(value){
    this.cadence = value;
  };

  this.set_gear = function(value){
    this.gear = value;
  };

  this.apply_brake = function(decrement){
    this.speed -= decrement;
  };
 
  this.speed_up = function(increment){
    this.speed += increment;
  };

  this.get_speed = function(){
    return this.speed; 
  };
});

//definition of mountain_bike class, inheriting from the bicycle class
var mountain_bike = bicycle.extend(function(_super){
  this.__id__ = 'bicycle.mountain_bike';//this is optional for debugging purposes and can be any random string

  //the mountain_bike class adds one more public member variable
  this.seat_height = null;

  //constructor function
  this.__init = function(start_height, start_cadence, start_speed, start_gear){
    _super.__init.call(this, start_cadence, start_speed, start_gear);//call super prototype
    this.seat_height = start_height;
  };

  this.set_height = function(value){
    this.seat_height = value;
  };

	//we're shadowing the function speed_up of bicycle
	this.speed_up = function(increment){
		//on a mountainbike we're speeding up much faster
		this.speed += increment*1.2;
	};

  //we're shadowing the function get_speed of bicycle
  this.get_speed = function(){
    //but we're calling the function of the parent 
    _super.get_speed.call(this);
  };
});

var bicycle_instance = new bicycle(1, 10, 1);
var mountain_bike_instance = new mountain_bike(90, 1, 10, 1);

console.log(bicycle_instance.speed);//prints 10 as speed of has not been modified
bicycle_instance.speed_up(15);//speeding up by 15 (e.g. m/h)
console.log(bicycle_instance.speed);//prints 25 as speed of has not been modified
console.log(typeof bicycle_instance);//returns object
console.log(bicycle_instance instanceof earth.core.object);//prints true
console.log(bicycle_instance instanceof bicycle);//prints true
console.log(bicycle_instance instanceof mountain_bike);//prints false
try{
	bicycle_instance.set_height(5);
}catch(e){
  console.log('Bicycle does not have a set_height function');
}


console.log(mountain_bike_instance.speed);//prints 10 as speed of has not been modified
mountain_bike_instance.speed_up(5);//speeding up by 5 (e.g. m/h)
console.log(mountain_bike_instance.speed);//prints 16 (10+5*1.2);
console.log(mountain_bike_instance.get_speed() == mountain_bike_instance.speed);//returns true as shadowed function get_speed calls parent function get_speed, returning the current speed
console.log(typeof bicycle_instance);//returns object
console.log(mountain_bike_instance instanceof earth.core.object);//prints true
console.log(mountain_bike_instance instanceof bicycle);//prints true
console.log(mountain_bike_instance instanceof mountain_bike);//prints false
```

## Static functions
```javascript
var earth = require('34rth-javascript-core-oo');

var my_static_class = earth.core.object.extend(new function(){
  this.statics = [];

  this.statics.say_hello = function(name){
    console.log('Hello ' + name);
  };
});

my_static_class.say_hello('Peter');//prints "Hello Peter"

//static functions can also be called from instances (without knowing the base class) via accessing the constructor
var instance = new my_static_class();
instance.constructor.say_hello('Marry');//prints "Hello Marry"
```

## Static functions and inheritance
```javascript
var earth = require('34rth-javascript-core-oo');

var my_parent_static_class = earth.core.object.extend(new function(){
  this.statics = [];

  this.statics.say_hello = function(name){
    console.log('Hello ' + name);
  };
});

var my_child_static_class = my_parent_static_class.extend(new function(){
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
```

## Mixins
Mixins can be used to implement functionality that can be shared between classes. As a class can only inherit from one other class (JAVA-style) mixins allow a way to reduce duplication of code (think aspect oriented programming in JAVA).
```javascript
var earth = require('34rth-javascript-core-oo');

var speaker = earth.core.mixin.extend(new function(){
  this.say_something = function(){
    console.log('something');
  };
});

//mixins can also inherit from other mixins
var hello = earth.core.mixin.extend(new function(){
  this.say_hello = function(name){
    console.log('Hello ' + name);
  };
});

var bye = earth.core.mixin.extend(new function(){
  this.say_goodbye = function(name){
    console.log('Bye ' + name);
  };
});

var app = earth.core.object.extend(new function(){
  this.includes = [speaker, hello, bye];//array of mixins to include
});


var test = new app();

test.say_something();//Prints "Something"
test.say_hello('Marry');//prints "Hello Marry"
test.say_goodbye('Marry');//prints "Bye Marry"
```

## Mixins and Inheritance
```javascript
var earth = require('34rth-javascript-core-oo');

var speaker = earth.core.mixin.extend(new function(){
  this.say_something = function(){
    console.log('something');
  };
});

//mixins can also inherit from other mixins
var speaker_with_good_memory = speaker.extend(new function(){
  this.names = [];

  this.say_hello = function(name){
    this.names.push(name);
    console.log('Hello ' + this.names.join(', '));
  };
});

var app = earth.core.object.extend(new function(){
  this.includes = [speaker, speaker_with_good_memory];//array of mixins to include
});


var test = new app();

test.say_something();//Prints "Something"
test.say_hello('Peter');//prints "Hello Peter"
test.say_hello('Marry');//prints "Hello Peter, Marry"
test.say_hello('Charly');//prints "Hello Peter, Marry, Charly"
```

## Mixin and chaining
```javascript
var earth = require('34rth-javascript-core-oo');

var speaker = earth.core.mixin.extend(new function(){
  this.say_something = function(){
    console.log('something');
    return this;//returns a reference to the object mixing
  };
});

//mixins can also inherit from other mixins
var speaker_with_good_memory = speaker.extend(new function(){
  this.names = [];

  this.say_hello = function(name){
    this.names.push(name);
    console.log('Hello ' + this.names.join(', '));
    return this;//returns a reference to the object mixing
  };
});

var app = earth.core.object.extend(new function(){
  this.includes = [speaker, speaker_with_good_memory];//array of mixins to include
});


var test = new app();

test.say_something().say_hello('Peter').say_hello('Marry').say_hello('Charly');

//OR

(new app()).say_something().say_hello('Peter').say_hello('Marry').say_hello('Charly');
```
# PERFORMANCE Tests
## Native Tests
Performance of 34rth-core-oo framework to native Javascript Object creation. 34rth inheritance depth of 3 has been tested for performance. See [performance.js](https://raw.githubusercontent.com/34rth/34rth-javascript-core-oo/master/performance.js) for details. 
```
===================== native javascript object instantiation ======================
creating 10,000,000 objects by literals
literal-object: **543.377ms**
creating 10,000,000 "Object.create()"
object: **881.320ms**
creating 10,000,000 arrays by literals
literal-array: **72.359ms**
creating 10,000,000 "new Array()"
array: **145.507ms**
creating 10,000,000 function class instances
literal: **1537.537ms**
===================== 34rth framework non complex object inheritance levels ======================
34rth framework creating 10,000,000 new class instances
earth-complex-depth-0: **112.470ms**
34rth framework creating 10,000,000 new subclass instances
earth-complex-depth-1: **319.050ms**
34rth framework creating 10,000,000 new subsubclass instances
earth-complex-depth-2: **945.159ms**
34rth framework creating 10,000,000 new subsubsubclass instances
earth-complex-depth-3: **1232.001ms`**
```
## Performance Comparison
Performance comparison against the following libraries/scripts:
* [inherit](https://www.npmjs.com/package/inherit)
* [Lava Class Manager](https://www.npmjs.com/package/lava-class-manager)
* [TypeScript](https://www.npmjs.com/package/typescript)
* [Fiber](https://www.npmjs.com/package/fiber)
* [John Resig's extend function](https://www.npmjs.com/package/class.extend)
* Native JavaScript inheritance 

### OBJECT INSTANTIATION
| Library | 100,000 | 1,000,000 | 10,000,000 | 
 | --- | --- | --- | --- | 
| TypeScriptChild | 14 | 102 | 1,024 | 
| CMBrowserMonoChild | 12 | 112 | 1,109 | 
| CMBrowserPolyChild | 11 | 103 | 1,028 | 
| CMServerFullrefMonoChild | 13 | 111 | 1,110 | 
| CMServerPartialrefMonoChild | 12 | 112 | 1,117 | 
| FiberChild | 16 | 146 | 1,467 | 
| JRChild | 18 | 165 | 1,663 | 
| NativeChild | 12 | 107 | 1,075 | 
| inherit | 14 | 127 | 1,281 | 
| subclass_34rth | 15 | 129 | 1,299 | 

### METHOD INVOCATION
| Library | 100,000 | 1,000,000 | 10,000,000 | 
 | --- | --- | --- | --- | 
| TypeScriptChild | 4 | 29 | 293 | 
| CMBrowserMonoChild | 4 | 26 | 252 | 
| CMBrowserPolyChild | 5 | 30 | 292 | 
| CMServerFullrefMonoChild | 4 | 24 | 233 | 
| CMServerPartialrefMonoChild | 4 | 23 | 235 | 
| FiberChild | 5 | 28 | 281 | 
| JRChild | 7 | 52 | 525 | 
| NativeChild | 3 | 24 | 252 | 
| inherit | 5 | 33 | 337 | 
| subclass_34rth | 5 | 32 | 323 | 

### COMBINED STATISTICS
| Library | 100,000 | 1,000,000 | 10,000,000 | 
 | --- | --- | --- | --- | 
| TypeScriptChild | 9 | 66 | 658 | 
| CMBrowserMonoChild | 8 | 69 | 681 | 
| CMBrowserPolyChild | 8 | 66 | 660 | 
| CMServerFullrefMonoChild | 8 | 68 | 671 | 
| CMServerPartialrefMonoChild | 8 | 68 | 676 | 
| FiberChild | 10 | 87 | 874 | 
| JRChild | 13 | 109 | 1,094 | 
| NativeChild | 7 | 66 | 663 | 
| inherit | 9 | 80 | 809 | 
| subclass_34rth | 10 | 81 | 811 | 

(Lower values are better).

# RUN TESTS AND TEST RESULTS
For mocha test results see [Travis CI](https://travis-ci.org/34rth/34rth-javascript-core-oo).

```bash
node make.js && ./node_modules/mocha/bin/mocha
```

