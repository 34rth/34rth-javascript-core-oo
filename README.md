[![Build Status](https://travis-ci.org/34rth/34rth-javascript-core-oo.svg?branch=master)](https://travis-ci.org/34rth/34rth-javascript-core-oo)
[![npm](http://img.shields.io/npm/v/34rth-javascript-core-oo.svg?style=flat-square)](https://www.npmjs.org/package/34rth-javascript-core-oo)
[![npm](https://img.shields.io/npm/l/34rth-javascript-core-oo.svg)]()

# TABLE OF CONTENTS
   * [GENERAL](#general)
   * [INSTALLATION](#installation)
      * [in Node.js](#in-nodejs)
      * [in Browser](#in-browser)
   * [EXAMPLES](#examples)
      * [Classes](#classes)
      * [Simple class inheritance and _super](#simple-class-inheritance-and-_super)
      * [Static functions](#static-functions)
      * [Static functions and inheritance](#static-functions-and-inheritance)
      * [Init Hooks](#init-hooks)
         * [Init Hooks and _super](#init-hooks-and-_super)
      * [Mixins](#mixins)
      * [Mixins and Inheritance](#mixins-and-inheritance)
      * [Mixin and chaining](#mixin-and-chaining)
   * [PERFORMANCE COMPARISON](#performance-comparison)
      * [Instantiation (inheritance depth 1)](#instantiation-inheritance-depth-1)
      * [Instantiation (inheritance depth 2)](#instantiation-inheritance-depth-2)
      * [Public Method Invocation (inheritance depth 1)](#public-method-invocation-inheritance-depth-1)
      * [Public Method Invocation (inheritance depth 2)](#public-method-invocation-inheritance-depth-2)
      * [Static Method Invocation](#static-method-invocation)
   * [TESTS](#run-tests-and-test-results)


# GENERAL
JavaScript (node.js/browser) library for inheritance and mixins in JavaScript with strong coupling of contexts. Includes private/public/static members/functions as well as mixin architecture (borrowing functionality from mixins);

# INSTALLATION
## in Node.js
```
npm install 34rth-javascript-core-oo
```
## in Browser
Download the [/bin/oo.js](https://raw.githubusercontent.com/34rth/34rth-javascript-core-oo/master/bin/oo.js) file from github

```html
<script type="text/javascript" src="oo.js"></script>
```
# EXAMPLES 
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
# PERFORMANCE COMPARISON
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
node performance/run_proprietary.js
```
There are two parameters available:
* --benchmark/-b: the type of benchmark to run. Valid values: instantiation, public, static
* --class/-c: the class that should be benchmarked.

## INSTANTIATION (INHERITANCE DEPTH 1)
| # | Library | ops/ms | total time (in ms) | Sample Size |
| :-: | --- | --: | --: | --: |
| 1 | augment | 20,734 | 482.31 | 10,000,000 |
| 2 | 34rth | 20,343 | 491.58 | 10,000,000 |
| 3 | native | 16,965 | 589.45 | 10,000,000 |
| 4 | jsface | 16,937 | 590.42 | 10,000,000 |
| 5 | inherits | 13,381 | 747.34 | 10,000,000 |
| 6 | Typescript | 13,336 | 749.87 | 10,000,000 |
| 7 | Lava.ClassManager polymorphic | 12,748 | 784.42 | 10,000,000 |
| 8 | Lava.ClassManager monomorphic | 12,093 | 826.93 | 10,000,000 |
| 9 | Fiber | 11,161 | 895.98 | 10,000,000 |
| 10 | John Resig's Class | 6,744 | 1,482.78 | 10,000,000 |

## INSTANTIATION (INHERITANCE DEPTH 2)
| # | Library | ops/ms | total time (in ms) | Sample Size |
| :-: | --- | --: | --: | --: |
| 1 | 34rth | 20,392 | 490.39 | 10,000,000 |
| 2 | augment | 17,876 | 559.42 | 10,000,000 |
| 3 | native | 13,636 | 733.37 | 10,000,000 |
| 4 | Lava.ClassManager polymorphic | 12,426 | 804.77 | 10,000,000 |
| 5 | jsface | 12,332 | 810.87 | 10,000,000 |
| 6 | Lava.ClassManager monomorphic | 11,824 | 845.74 | 10,000,000 |
| 7 | inherits | 11,194 | 893.31 | 10,000,000 |
| 8 | Typescript | 10,630 | 940.72 | 10,000,000 |
| 9 | Fiber | 9,210 | 1,085.78 | 10,000,000 |
| 10 | John Resig's Class | 3,889 | 2,571.49 | 10,000,000 |

## PUBLIC METHOD INVOCATION (INHERITANCE DEPTH 1)
| # | Library | ops/ms | total time (in ms) | Sample Size |
| :-: | --- | --: | --: | --: |
| 1 | Typescript | 7,215 | 1,385.91 | 10,000,000 |
| 2 | native | 7,049 | 1,418.74 | 10,000,000 |
| 3 | Lava.ClassManager monomorphic | 6,959 | 1,436.98 | 10,000,000 |
| 4 | 34rth | 6,786 | 1,473.63 | 10,000,000 |
| 5 | augment | 6,316 | 1,583.35 | 10,000,000 |
| 6 | jsface | 6,088 | 1,642.56 | 10,000,000 |
| 7 | Lava.ClassManager polymorphic | 5,530 | 1,808.43 | 10,000,000 |
| 8 | Fiber | 5,381 | 1,858.52 | 10,000,000 |
| 9 | inherits | 5,307 | 1,884.27 | 10,000,000 |
| 10 | John Resig's Class | 2,581 | 3,875.01 | 10,000,000 |

## PUBLIC METHOD INVOCATION (INHERITANCE DEPTH 2)
| # | Library | ops/ms | total time (in ms) | Sample Size |
| :-: | --- | --: | --: | --: |
| 1 | Lava.ClassManager monomorphic | 6,876 | 1,454.40 | 10,000,000 |
| 2 | Typescript | 6,325 | 1,580.93 | 10,000,000 |
| 3 | native | 5,968 | 1,675.62 | 10,000,000 |
| 4 | 34rth | 5,899 | 1,695.13 | 10,000,000 |
| 5 | augment | 5,725 | 1,746.59 | 10,000,000 |
| 6 | jsface | 5,204 | 1,921.58 | 10,000,000 |
| 7 | Lava.ClassManager polymorphic | 5,126 | 1,950.87 | 10,000,000 |
| 8 | Fiber | 4,570 | 2,188.11 | 10,000,000 |
| 9 | inherits | 4,519 | 2,213.08 | 10,000,000 |
| 10 | John Resig's Class | 1,900 | 5,264.32 | 10,000,000 |


## STATIC METHOD INVOCATION
| # | Library | ops/ms | total time (in ms) | Sample Size |
| :-: | --- | --: | --: | --: |
| 1 | 34rth | 14,559 | 686.88 | 10,000,000 |
| 2 | Typescript | 13,608 | 734.84 | 10,000,000 |
| 3 | jsface | 12,938 | 772.92 | 10,000,000 |
| 4 | inherits | 12,279 | 814.38 | 10,000,000 |
| 5 | native | n\a | n\a | n\a |
| 6 | John Resig's Class | n\a | n\a | n\a |
| 7 | Fiber | n\a | n\a | n\a |
| 8 | Lava.ClassManager polymorphic | n\a | n\a | n\a |
| 9 | Lava.ClassManager monomorphic | n\a | n\a | n\a |
| 10| augment | n\a | n\a | n\a |


# TESTS
For mocha test results see [Travis CI](https://travis-ci.org/34rth/34rth-javascript-core-oo).

```bash
node make.js && ./node_modules/mocha/bin/mocha
```
