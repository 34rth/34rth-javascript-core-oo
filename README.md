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
var bicycle = earth.core.object.extend(function(_super){
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
    return _super.get_speed.call(this);
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
console.log(mountain_bike_instance instanceof mountain_bike);//prints true 

```

## Static functions
```javascript
var earth = require('34rth-javascript-core-oo');

var my_static_class = earth.core.object.extend(function(_super){
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

var my_parent_static_class = earth.core.object.extend(function(_super){
  this.statics = [];

  this.statics.say_hello = function(name){
    console.log('Hello ' + name);
  };
});

var my_child_static_class = my_parent_static_class.extend(function(_super){
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

## Init Hooks
Init hooks allow to trigger any number of callback functions whenever a new instance of a class is created.

```javascript
var my_class = earth.core.object.extend(function(_super){
  this.__init = function(number){
    console.log('Yaaay, the constructor was just called');
    this.number = number;
  };
});

my_class.add_init_hook(function(_super){
  console.log('Class has been initialised with number ' + this.number);
});

new my_class(10);
//'Yaaay, the constructor was just called
//Class has been initialised with number 10
```

### Init Hooks and _super

```javascript
var my_class = earth.core.object.extend(function(_super){
  this.__init = function(number){
    console.log('Yaaay, the constructor just was called');
    this.number = number;
  };
});

var my_child_class = earth.core.object.extend(function(_super){
  this.__init = function(number){
    _super.init.call(number);
  };
});

my_class.add_init_hook(function(_super){
  console.log('Class has been initialised with number ' + _super.number);
});

new my_class(10);
//'Yaaay, the constructor just was called
//Class has been initialised with number 10
```


## Mixins
Mixins can be used to implement functionality that can be shared between classes. As a class can only inherit from one other class (JAVA-style) mixins allow a way to reduce duplication of code (think aspect oriented programming in JAVA).
```javascript
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
```

## Mixins and Inheritance
```javascript
var earth = require('34rth-javascript-core-oo');

var speaker = earth.core.mixin.extend(function(_super){
  this.say_something = function(){
    console.log('something');
  };
});

//mixins can also inherit from other mixins
var speaker_with_good_memory = speaker.extend(function(_super){
  this.names = null;

  this.__init = function(){
    this.names = [];
  };

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
```

## Mixin and chaining
```javascript
var earth = require('34rth-javascript-core-oo');

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
* [Augment](https://www.npmjs.com/package/augment)
* [jsface](https://www.npmjs.com/package/jsface)
* Native JavaScript inheritance 

To run the performance tests, run 

```
node performance/test.js
```
There are two parameters available:
* --benchmark/-b: the type of benchmark to run. Valid values: instantiation, public, static
* --class/-c: the class that should be benchmarked.

### INSTANTIATION
| # | Library | ops/sec | Relative MoE | Min ops/sec | Max ops/sec | Sample Size |
| --- | --- | --- | --- | --- | --- | --- |
| 1| augment | 16,554,667 | 0.62 | 16,452,155 | 16,657,178 | 45 |
| 2| native | 13,977,851 | 0.60 | 13,894,656 | 14,061,046 | 47 |
| 3| jsface | 13,230,405 | 1.08 | 13,087,322 | 13,373,488 | 91 |
| 4| Typescript | 11,381,806 | 0.29 | 11,348,350 | 11,415,262 | 92 |
| 5| 34rth | 10,784,427 | 1.80 | 10,589,839 | 10,979,014 | 45 |
| 6| Lava.ClassManager polymorphic | 10,606,884 | 0.93 | 10,508,576 | 10,705,192 | 92 |
| 7| inherits | 10,490,813 | 2.88 | 10,188,177 | 10,793,450 | 43 |
| 8| Lava.ClassManager monomorphic | 10,224,881 | 1.59 | 10,062,467 | 10,387,296 | 47 |
| 9| Fiber | 9,736,226 | 2.43 | 9,499,437 | 9,973,015 | 25 |
| 10| John Resig's Class | 5,376,163 | 0.34 | 5,357,756 | 5,394,570 | 70 |

### PUBLIC METHOD INVOCATION
| # | Library | ops/sec | Relative MoE | Min ops/sec | Max ops/sec | Sample Size |
| --- | --- | --- | --- | --- | --- | --- |
| 1| native | 17,342,555 | 0.54 | 17,248,245 | 17,436,866 | 46 |
| 2| Fiber | 16,988,204 | 1.39 | 16,751,649 | 17,224,759 | 20 |
| 3| Typescript | 15,353,163 | 0.74 | 15,239,312 | 15,467,013 | 44 |
| 4| Lava.ClassManager monomorphic | 14,648,263 | 2.72 | 14,249,923 | 15,046,602 | 15 |
| 5| Lava.ClassManager polymorphic | 14,316,496 | 0.55 | 14,237,154 | 14,395,838 | 69 |
| 6| augment | 13,566,051 | 0.41 | 13,510,645 | 13,621,457 | 68 |
| 7| jsface | 13,239,465 | 1.51 | 13,038,948 | 13,439,982 | 9 |
| 8| 34rth | 13,013,402 | 0.81 | 12,908,162 | 13,118,642 | 23 |
| 9| inherits | 10,416,290 | 2.28 | 10,179,216 | 10,653,365 | 55 |
| 10| John Resig's Class | 7,638,413 | 1.43 | 7,529,471 | 7,747,355 | 68 |

### STATIC METHOD INVOCATION
| # | Library | ops/sec | Relative MoE | Min ops/sec | Max ops/sec | Sample Size |
| --- | --- | --- | --- | --- | --- | --- |
| 1| Typescript | 12,091,492 | 1.60 | 11,897,652 | 12,285,331 | 67 |
| 2| jsface | 10,458,435 | 1.34 | 10,317,970 | 10,598,900 | 68 |
| 3| inherits | 10,348,296 | 2.90 | 10,047,727 | 10,648,866 | 22 |
| 4| 34rth | 10,224,698 | 3.30 | 9,887,248 | 10,562,148 | 18 |
| 5| native | n\a | n\a | n\a | n\a | n\a |
| 6| John Resig's Class | n\a | n\a | n\a | n\a | n\a |
| 7| Fiber | n\a | n\a | n\a | n\a | n\a |
| 8| Lava.ClassManager polymorphic | n\a | n\a | n\a | n\a | n\a |
| 9| Lava.ClassManager monomorphic | n\a | n\a | n\a | n\a | n\a |
| 10| augment | n\a | n\a | n\a | n\a | n\a |


# RUN TESTS AND TEST RESULTS
For mocha test results see [Travis CI](https://travis-ci.org/34rth/34rth-javascript-core-oo).

```bash
node make.js && ./node_modules/mocha/bin/mocha
```

