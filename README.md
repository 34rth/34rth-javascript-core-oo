# Installation
```
npm install 34rth-javascript-core-oo

```
# Examples 
## Simple inheritance
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
var mountain_bike = bicycle.extend(new function(){
  this.__id__ = 'bicycle.mountain_bike';//this is optional for debugging purposes and can be any random string

  //the mountain_bike class adds one more public member variable
  this.seat_height = null;

  //constructor function
  this.__init = function(start_height, start_cadence, start_speed, start_gear){
    bicycle.prototype.__init.call(this, start_cadence, start_speed, start_gear);//call super prototype
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
    bicycle.prototype.get_speed.call(this);
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


# RUN TESTS
```bash
node make.js && ./node_modules/mocha/bin/mocha
```
