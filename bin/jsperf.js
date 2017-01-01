  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  var JRClass = function(){};

  // Create a new Class that inherits from this class
  JRClass.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function JRClass() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    JRClass.prototype = prototype;

    // Enforce the constructor to be what we expect
    JRClass.constructor = JRClass;

    // And make this class extendable
    JRClass.extend = arguments.callee;

    return JRClass;
  };

/*
Copyright (c) 2005-2010 Sam Stephenson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* Based on Alex Arnell's inheritance implementation. */
/** section: Language
 * class Class
 *
 *  Manages Prototype's class-based OOP system.
 *
 *  Refer to Prototype's web site for a [tutorial on classes and
 *  inheritance](http://prototypejs.org/learn/class-inheritance).
**/
/* ------------------------------------ */
/* Import from object.js                */
/* ------------------------------------ */
var _toString = Object.prototype.toString,
    NULL_TYPE = 'Null',
    UNDEFINED_TYPE = 'Undefined',
    BOOLEAN_TYPE = 'Boolean',
    NUMBER_TYPE = 'Number',
    STRING_TYPE = 'String',
    OBJECT_TYPE = 'Object',
    FUNCTION_CLASS = '[object Function]';
function isFunction(object) {
  return _toString.call(object) === FUNCTION_CLASS;
}
function extend(destination, source) {
  for (var property in source) if (source.hasOwnProperty(property)) // modify protect primitive slaughter
    destination[property] = source[property];
  return destination;
}
function keys(object) {
  if (Type(object) !== OBJECT_TYPE) { throw new TypeError(); }
  var results = [];
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      results.push(property);
    }
  }
  return results;
}
function Type(o) {
  switch(o) {
    case null: return NULL_TYPE;
    case (void 0): return UNDEFINED_TYPE;
  }
  var type = typeof o;
  switch(type) {
    case 'boolean': return BOOLEAN_TYPE;
    case 'number':  return NUMBER_TYPE;
    case 'string':  return STRING_TYPE;
  }
  return OBJECT_TYPE;
}
function isUndefined(object) {
  return typeof object === "undefined";
}
/* ------------------------------------ */
/* Import from Function.js              */
/* ------------------------------------ */
var slice = Array.prototype.slice;
function argumentNames(fn) {
  var names = fn.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
    .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
    .replace(/\s+/g, '').split(',');
  return names.length == 1 && !names[0] ? [] : names;
}
function wrap(fn, wrapper) {
  var __method = fn;
  return function() {
    var a = update([bind(__method, this)], arguments);
    return wrapper.apply(this, a);
  }
}
function update(array, args) {
  var arrayLength = array.length, length = args.length;
  while (length--) array[arrayLength + length] = args[length];
  return array;
}
function merge(array, args) {
  array = slice.call(array, 0);
  return update(array, args);
}
function bind(fn, context) {
  if (arguments.length < 2 && isUndefined(arguments[0])) return this;
  var __method = fn, args = slice.call(arguments, 2);
  return function() {
    var a = merge(args, arguments);
    return __method.apply(context, a);
  }
}

/* ------------------------------------ */
/* Import from Prototype.js             */
/* ------------------------------------ */
var emptyFunction = function(){};

var Class = (function() {

  // Some versions of JScript fail to enumerate over properties, names of which
  // correspond to non-enumerable properties in the prototype chain
  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      // check actual property name, so that it works with augmented Object.prototype
      if (p === 'toString') return false;
    }
    return true;
  })();

  /**
   *  Class.create([superclass][, methods...]) -> Class
   *    - superclass (Class): The optional superclass to inherit methods from.
   *    - methods (Object): An object whose properties will be "mixed-in" to the
   *        new class. Any number of mixins can be added; later mixins take
   *        precedence.
   *
   *  [[Class.create]] creates a class and returns a constructor function for
   *  instances of the class. Calling the constructor function (typically as
   *  part of a `new` statement) will invoke the class's `initialize` method.
   *
   *  [[Class.create]] accepts two kinds of arguments. If the first argument is
   *  a [[Class]], it's used as the new class's superclass, and all its methods
   *  are inherited. Otherwise, any arguments passed are treated as objects,
   *  and their methods are copied over ("mixed in") as instance methods of the
   *  new class. In cases of method name overlap, later arguments take
   *  precedence over earlier arguments.
   *
   *  If a subclass overrides an instance method declared in a superclass, the
   *  subclass's method can still access the original method. To do so, declare
   *  the subclass's method as normal, but insert `$super` as the first
   *  argument. This makes `$super` available as a method for use within the
   *  function.
   *
   *  To extend a class after it has been defined, use [[Class#addMethods]].
   *
   *  For details, see the
   *  [inheritance tutorial](http://prototypejs.org/learn/class-inheritance)
   *  on the Prototype website.
  **/
  function subclass() {};
  function create() {
    var parent = null, properties = [].slice.apply(arguments);
    if (isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  /**
   *  Class#addMethods(methods) -> Class
   *    - methods (Object): The methods to add to the class.
   *
   *  Adds methods to an existing class.
   *
   *  [[Class#addMethods]] is a method available on classes that have been
   *  defined with [[Class.create]]. It can be used to add new instance methods
   *  to that class, or overwrite existing methods, after the class has been
   *  defined.
   *
   *  New methods propagate down the inheritance chain. If the class has
   *  subclasses, those subclasses will receive the new methods &mdash; even in
   *  the context of `$super` calls. The new methods also propagate to instances
   *  of the class and of all its subclasses, even those that have already been
   *  instantiated.
   *
   *  ##### Examples
   *
   *      var Animal = Class.create({
   *        initialize: function(name, sound) {
   *          this.name  = name;
   *          this.sound = sound;
   *        },
   *
   *        speak: function() {
   *          alert(this.name + " says: " + this.sound + "!");
   *        }
   *      });
   *
   *      // subclassing Animal
   *      var Snake = Class.create(Animal, {
   *        initialize: function($super, name) {
   *          $super(name, 'hissssssssss');
   *        }
   *      });
   *
   *      var ringneck = new Snake("Ringneck");
   *      ringneck.speak();
   *
   *      //-> alerts "Ringneck says: hissssssss!"
   *
   *      // adding Snake#speak (with a supercall)
   *      Snake.addMethods({
   *        speak: function($super) {
   *          $super();
   *          alert("You should probably run. He looks really mad.");
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck says: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
   *
   *      // redefining Animal#speak
   *      Animal.addMethods({
   *        speak: function() {
   *          alert(this.name + 'snarls: ' + this.sound + '!');
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck snarls: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
  **/
  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = keys(source);

    // IE6 doesn't enumerate `toString` and `valueOf` (among other built-in `Object.prototype`) properties,
    // Force copy if they're not Object.prototype ones.
    // Do not copy other Object.prototype.* for performance reasons
    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && isFunction(value) &&
          argumentNames(value)[0] == "$super") {
        var method = value;
        value = wrap((function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property), method);

        value.valueOf = bind(method.valueOf, method);
        value.toString = bind(method.toString, method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();

PTClass = Class;

////For performance tests please see: http://jsperf.com/js-inheritance-performance/34 + http://jsperf.com/js-inheritance-performance/35 + http://jsperf.com/js-inheritance-performance/36

	var isNode = typeof global != "undefined";
	if (!String.prototype.format) {
		var regexes = {};
		String.prototype.format = function format(parameters) {
			/// <summary>Equivalent to C# String.Format function</summary>
			/// <param name="parameters" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>

			for (var formatMessage = this, args = arguments, i = args.length; --i >= 0;)
				formatMessage = formatMessage.replace(regexes[i] || (regexes[i] = RegExp("\\{" + (i) + "\\}", "gm")), args[i]);
			return formatMessage;
		};
		if (!String.format) {
			String.format = function format(formatMessage, params) {
				/// <summary>Equivalent to C# String.Format function</summary>
				/// <param name="formatMessage" type="string">The message to be formatted. It should contain {0}, {1} etc. for all the given params</param>
				/// <param name="params" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>
				for (var args = arguments, i = args.length; --i;)
					formatMessage = formatMessage.replace(regexes[i - 1] || (regexes[i - 1] = RegExp("\\{" + (i - 1) + "\\}", "gm")), args[i]);
				return formatMessage;
			};
		}
	}
	///#DEBUG
	//>>excludeStart("WASSERT", true);
	if (typeof window != "undefined")
		window.WAssert = WAssert;
	function WAssert(trueishCondition, message, arg1, arg2, argEtc) {
		/// <summary>Returns an `assert function` if the condition is false an a `noop function` (a function which does nothing) if the condition is true. <br/>
		///  WAsserts will not be included in production code in anyways, hence the minifier will remove all the WAssert calls<br/><br/>
		///  You always need to call the WAssert function twice since the first call always returns a function i.e. WAssert(false, "{0} failed", "Condition")()
		/// </summary>
		/// <param name="trueishCondition" type="Boolean">The condition to be tested. It should be true so nothing happens, or false to assert the error message</param>
		/// <param name="message" type="String || Function">The message to be asserted. If passed a function it will be evaluated all the times, regardless of the condition</param>
		/// <param name="arg1" type="Object" optional="true">First argument to replace all of the {0} occurences from the message</param>
		/// <param name="arg2" type="Object" optional="true">Second argument to replace all of the {1} occurences from the message</param>
		/// <param name="argEtc" type="Object" optional="true" parameterArray="true">Third argument to replace all of the {3} occurences from the message.<br/> You can add as many arguments as you want and they will be replaced accordingly</param>
		if (typeof message === "function")
			message = message.apply(this, arguments) || "";
		if (typeof trueishCondition === "function" ? !trueishCondition.apply(this, arguments) : !trueishCondition) {
			var parameters = Array.prototype.slice.call(arguments, 1);
			var msg = typeof message == "string" ? String.format.apply(message, parameters) : message;
			return typeof console != "undefined" && !console.__throwErrorOnAssert && console.assert && console.assert.bind && console.assert.bind(console, trueishCondition, msg) || function consoleAssertThrow() { throw new Error(msg); };
		}
		return __;
	};
	//>>excludeEnd("WASSERT");
	///#ENDDEBUG

	var Function_prototype = Function.prototype;
	var Array_prototype = Array.prototype;
	var Array_prototype_forEach = Array_prototype.forEach;
	var Object_defineProperty = Object.defineProperty;
	var Object_defineProperties = typeof Object.defineProperties === "function"
	var supportsProto = {};

	supportsProto = supportsProto.__proto__ === Object.prototype;
	if (supportsProto) {
		try {
			supportsProto = {};
			supportsProto.__proto__ = { Object: 1 };
			supportsProto = supportsProto.Object === 1;//setting __proto__ in firefox is terribly slow!
		} catch (ex) { supportsProto = false; }
	}
	/* IE8 and older hack! */
	if (typeof Object.getPrototypeOf !== "function")
		Object.getPrototypeOf = supportsProto
			? function get__proto__(object) {
				return object.__proto__;
			}
			: function getConstructorHack(object) {
				// May break if the constructor has been tampered with
				return object == null || !object.constructor || object === Object.prototype ? null :
					(object.constructor.prototype === object ?
					Object.prototype
					: object.constructor.prototype);
			};
	function __() { };
	//for ancient browsers - polyfill Array.prototype.forEach
	if (!Array_prototype_forEach) {
		Array_prototype.forEach = Array_prototype_forEach = function forEach(fn, scope) {
			for (var i = 0, len = this.length; i < len; ++i) {
				fn.call(scope || this, this[i], i, this);
			}
		}
	}

	Function_prototype.fastClass = function fastClass(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.fastClass(function(base, baseCtor) { <br/>
		/// ___ this.constructor = function(name) { //the cosntructor can be optional <br/>
		/// ______ baseCtor.call(this, name); //call the baseCtor <br/>
		/// ___ };<br/>
		/// ___ this.draw = function() {  <br/>
		/// ______ return base.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { this.constructor = function() {..}; this.method1 = function() {...}... }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>

		//this == constructor of the base "Class"
		var baseClass = this;
		var base = this.prototype;
		creator = creator || function fastClassCreator() { this.constructor = function fastClassCtor() { return baseClass.apply(this, arguments) || this; } };
		creator.prototype = base;

		//creating the derrived class' prototype
		var derrivedProrotype = new creator(base, this);
		var Derrived;
		//did you forget or not intend to add a constructor? We'll add one for you
		if (!derrivedProrotype.hasOwnProperty("constructor"))
			derrivedProrotype.constructor = function fastClassDefaultConstructor() { return baseClass.apply(this, arguments) || this; }
		Derrived = derrivedProrotype.constructor;
		//setting the derrivedPrototype to constructor's prototype
		Derrived.prototype = derrivedProrotype;

		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			var creatorResult = derrivedProrotype;
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseClass.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 


		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into derrivedPrototype in the creator function by setting creator.prototype = base on above
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;
		//returning the constructor
		return Derrived;
	};

	Function_prototype.inheritWith = !supportsProto ? function inheritWith(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith(function(base, baseCtor) { <br/>
		/// ___ return { <br/>
		/// ______ constructor: function(name) { //the cosntructor can be optional <br/>
		/// _________ baseCtor.call(this, name); //explicitelly call the base class by name <br/>
		/// ______ },<br/>
		/// ______ draw: function() {  <br/>
		/// _________ return base.call(this, "square"); //explicitely call the base class prototype's  method by name <br/>
		/// ______ },<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor passed into the object as parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith({ <br/>
		/// ___ constructor: function(name) { //the cosntructor can be optional <br/>
		/// ______ Figure.call(this, name); //call the baseCtor <br/>
		/// ___ },<br/>
		/// ___ draw: function() {  <br/>
		/// ______ return Figure.prototype.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ },<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Object">An object containing members for the new function's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var baseCtor = this;
		var creatorResult = (typeof creator === "function" ? creator.call(this, this.prototype, this) : creator) || {};
		var Derrived = creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : function inheritWithConstructor() {
			return baseCtor.apply(this, arguments) || this;
		}; //automatic constructor if ommited
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseCtor.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
			$.extend(true, creatorResult, new Derrived);
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		var derrivedPrototype;
		__.prototype = this.prototype;
		Derrived.prototype = derrivedPrototype = new __;


		creator = creatorResult;//change the first parameter with the creatorResult
		Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;

		return Derrived;
	} :// when browser supports __proto__ setting it is way faster than iterating the object
	function inheritWithProto(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith(function(base, baseCtor) { <br/>
		/// ___ return { <br/>
		/// ______ constructor: function(name) { //the cosntructor can be optional <br/>
		/// _________ baseCtor.call(this, name); //explicitelly call the base class by name <br/>
		/// ______ },<br/>
		/// ______ draw: function() {  <br/>
		/// _________ return base.call(this, "square"); //explicitely call the base class prototype's  method by name <br/>
		/// ______ },<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor passed into the object as parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith({ <br/>
		/// ___ constructor: function(name) { //the cosntructor can be optional <br/>
		/// ______ Figure.call(this, name); //call the baseCtor <br/>
		/// ___ },<br/>
		/// ___ draw: function() {  <br/>
		/// ______ return Figure.prototype.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ },<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Object">An object containing members for the new function's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var baseCtor = this;
		var creatorResult = (typeof creator === "function" ? creator.call(this, this.prototype, this) : creator) || {};
		var Derrived = creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : function inheritWithProtoDefaultConstructor() {
			return baseCtor.apply(this, arguments) || this;
		}; //automatic constructor if ommited
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			intellisense.logMessage("cucu rucu");
			creatorResult.cucu = 1;
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseCtor.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
			$.extend(true, creatorResult, new Derrived);
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		Derrived.prototype = creatorResult;
		creatorResult.__proto__ = this.prototype;
		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into creatorResult by using __proto__
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;
		return Derrived;
	};
	Function_prototype.define = function define(prototype, mixins) {
		/// <summary>Define members on the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Function || Plain Object">{} or function(prototype, ctor) {}<br/>A custom object with the methods or properties to be added on Extendee.prototype<br/><br/>
		/// You can sepcify enumerable: false, which will define the members as non-enumerable making use of Object.defineProperty(this, key, {enumerable: false, value: copyPropertiesFrom[key]})
		///</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to this function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		var constructor = this;
		var extendeePrototype = this.prototype;
		var creatorResult = prototype;
		var key, enumerable;
		if (prototype) {
			if (typeof prototype === "function")
				prototype = prototype.call(extendeePrototype, this.prototype, this);
			if (prototype.enumerable === false) {
				for (key in prototype)
					if (key !== 'enumerable')
						Object.defineProperty(extendeePrototype, key, { enumerable: false, value: prototype[key] });
			}
			else for (key in prototype)
				extendeePrototype[key] = prototype[key];
		}
		prototype = null;
		//intellisense.logMessage("defining....");
		(arguments.length > 2 || mixins) && (extendeePrototype.hasOwnProperty("__mixins__") || (Object_defineProperties ? (Object_defineProperty(extendeePrototype, "__mixins__", { enumerable: false, value: [], writeable: false }).__mixins__.__hidden = true) : extendeePrototype.__mixins__ = [])) && Array_prototype_forEach.call(arguments, function forEachMixin(mixin, index, mixinValue, isFunction) {
			isFunction = typeof mixin === 'function';
			if (isFunction) {
				__.prototype = mixin.prototype;
				mixinValue = new mixin(extendeePrototype, constructor);
			}
			else mixinValue = mixin;
			if (mixinValue) {
				//store the functions in the __mixins__ member on the prototype so they will be called on Function.initMixins(instance) function
				isFunction && extendeePrototype.__mixins__.push(mixin);
				//copy the prototype members from the mixin.prototype to extendeePrototype so we are only doing this once
				for (var key in mixinValue)
					if (key != "constructor" && key != "prototype") {
						//intellisense.logMessage("injecting " + key + " into " + extendeePrototype.name);
						///#DEBUG
						//>>excludeStart("WASSERT", true);
						WAssert(true, function WAssertInjecting() {
							//trigger intellisense on VS2012 for mixins
							if (key in extendeePrototype) {
								//allow abastract members on class/mixins so they can be replaced
								if (extendeePrototype[key] && extendeePrototype[key].abstract)
									return;
								var msg = "The '{0}' mixin defines a '{1}' named '{2}' which is already defined on the class {3}!"
									.format(isFunction && mixin.name || (index - 1), typeof mixinValue[key] === "function" ? "function" : "member", key, constructor.name ? ("'" + constructor.name + "'") : '');
								console.log(msg)
								!isNode && window.intellisense && intellisense.logMessage(msg);
								throw new Error(msg);
							}
							//set a custom glyph icon for mixin functions
							if (typeof mixinValue[key] === "function" && mixin != mixinValue[key] && mixin != constructor && mixin !== extendeePrototype) {
								mixinValue[key].__glyph = "GlyphCppProject";
							}
						});
						//>>excludeEnd("WASSERT");
						///#ENDDEBUG 
						extendeePrototype[key] = mixinValue[key];
					}
			}
		});
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(true, !isNode && window.intellisense && function WAssertExtending() {
			//trigger intellisense on VS2012 for base class members, because same as IE, VS2012 doesn't support __proto__
			//for (var i in extendeePrototype)
			//	if (!creatorResult.hasOwnProperty(i)) {
			//		creatorResult[i] = extendeePrototype[i];
			//	}
			//inject properties from the new constructor
			//extendeePrototype = {};
			//intellisense.logMessage("injecting ctor.properties into " + JSON.stringify(creatorResult) + /function (.*)\(.*\)/gi.exec(arguments.callee.caller.caller.caller.toString())[1])
			__.prototype = extendeePrototype;
			var proto = new __;
			constructor.call(proto);
			for (var i in proto) {
				//intellisense.logMessage(i)
				if (i !== "constructor")
					//if (proto.hasOwnProperty(i))
					if (!creatorResult.hasOwnProperty(i))
						creatorResult[i] = proto[i];
			}

		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		return this;
	}


	Function.define = function Function_define(func, prototype, mixins) {
		/// <signature>
		/// <summary>Extends the given func's prototype with provided members of prototype and ensures calling the mixins in the constructor</summary>
		/// <param name="func" type="Function">Specify the constructor function you want to define i.e. function() {}</param>
		/// <param name="prototype" type="Plain Object" optional="true">Specify an object that contain the functions or members that should defined on the provided func's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned func's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Extends the given constructor's prototype with provided members of prototype and ensures calling the mixins in the constructor</summary>
		/// <param name="prototype" type="Plain Object">Specify an object that contain the constructor and functions or members that should defined on the provided constructor's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned func's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var result;
		var constructor = func || function defineDefaultConstructor() { }; //automatic constructor if ommited
		var applyDefine = arguments.length > 1;
		if (typeof func !== "function") {
			constructor = func.hasOwnProperty("constructor") ? func.constructor : function constructorDefaultObjConstructor() { };

			constructor.prototype = func;
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//VS2012 intellisense don't forward the actual creator as the function's prototype b/c we want to "inject" constructor's members into it
				function clone() {
					for (var i in func)
						if (func.hasOwnProperty(i))
							this[i] = func[i];
				}
				clone.prototype = Object.getPrototypeOf(func);
				constructor.prototype = new clone;
			});
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 


			applyDefine = true;
		}
		else {
			func = prototype;
			prototype = null;
		}
		applyDefine && Function_prototype.define.apply(constructor, arguments);

		result = function defineInitMixinsConstructor() {
			// automatically call initMixins and then the first constructor
			Function.initMixins(this);
			return constructor.apply(this, arguments) || this;
		}
		//we are sharing constructor's prototype
		result.prototype = constructor.prototype;
		//forward the VS2012 intellisense to the given constructor function
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(true, !isNode && window.intellisense && function WAssert() {
			window.intellisense && intellisense.redirectDefinition(result, constructor);
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		result.constructor = result.prototype.constructor = constructor.constructor = constructor.prototype.constructor = result;
		return result;
	};

	Function_prototype.defineStatic = function (copyPropertiesFrom) {
		/// <summary>Copies all the members of the given object, including those on its prototype if any, to this function (and not on its prototype)<br/>For extending this functions' prototype use .define()
		/// <param name="copyPropertiesFrom" type="Object">The object to copy the properties from<br/><br/>
		/// You can sepcify enumerable: false, which will define the members as non-enumerable making use of Object.defineProperty(this, key, {enumerable: false, value: copyPropertiesFrom[key]})</summary>
		/// </param>
		var key;
		if (typeof copyPropertiesFrom == "object")
			if (copyPropertiesFrom.enumerable === false) {
				for (key in copyPropertiesFrom)
					if (key !== 'enumerable')
					Object.defineProperty(this, key, { enumerable: false, configurable: true, value: copyPropertiesFrom[key] });
			}
			for (key in copyPropertiesFrom) {
				this[key] = copyPropertiesFrom[key];
			}
		return this;
	}
	function defaultAbstractMethod() {
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, "Not implemented")();
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
	}
	defaultAbstractMethod.defineStatic({ abstract: true });
	Function.abstract = function (message, func) {
		/// <summary>Returns an abstract function that asserts the given message. Optionally you can add some code to happen before assertion too</summary>
		/// <param name="message" type="String || Function">The message to be thrown when the newly method will be called. <br/>Defaults to: Not implemented</param>
		/// <param name="func" type="Function" optional="true">Specify a custom function to be called before the assertion is thrown.</param>
		var result = message || func ? (function () {
			if (typeof message === "function")
				message.apply(this, arguments);
			if (typeof func === "function")
				func.apply(this, arguments);
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			if (typeof message === "string")
				WAssert(false, message)();
			else defaultAbstractMethod();
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 

		}).defineStatic({ abstract: true }) : defaultAbstractMethod;

		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(true, !isNode && window.intellisense && function () {
			if (result != defaultAbstractMethod) {
				if (typeof message === "function")
					intellisense.redirectDefinition(result, message);
				if (typeof func === "function")
					intellisense.redirectDefinition(result, func);
			}
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 

		return result;
	}

	Function.initMixins = supportsProto ? function initMixins(objectInstance) {
		/// <signature>
		/// <summary>Initializes the mixins on all of the prototypes of the given object instance<br/>This should only be called once per object, usually in the first constructor (the most base class)</summary>
		/// <param name="objectInstance" type="Object">The object instance for which the mixins needs to be initialized</param>
		/// </signature>
		if (objectInstance && !objectInstance.__initMixins__) {
			var p = objectInstance, mixins, length, i, mixin, calledMixins = {};
			objectInstance.__initMixins__ = 1;
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//hide __initMixins from VS2012 intellisense
				objectInstance.__initMixins__ = { __hidden: true };
			});
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 
			while (p) {
				p = p.__proto__;
				if (p && p.hasOwnProperty("__mixins__") && (mixins = p.__mixins__) && (length = mixins.length))
					for (i = 0; mixin = mixins[i], i < length; i++) {
						//WAssert(true, window.intellisense && function WAssert() {
						//	//for correct VS2012 intellisense, at the time of mixin declaration we need to execute new mixin() rather than mixin.call(objectInstance, p, p.constructor) otherwise the glyph icons will look like they are defined on mixin / prototype rather than on the mixin itself
						//	if (!(mixin in calledMixins)) {
						//		calledMixins[mixin] = 1;
						//		new mixin(p, p.constructor);
						//	}
						//});
						if (!(mixin in calledMixins)) {
							calledMixins[mixin] = 1;
							mixin.call(objectInstance, p, p.constructor);
						}
					}
			}
			objectInstance.__initMixins__ = undefined;
		}
	}: function initMixinsWithoutProto(objectInstance) {
		/// <signature>
		/// <summary>Initializes the mixins on all of the prototypes of the given object instance<br/>This should only be called once per object, usually in the first constructor (the most base class)</summary>
		/// <param name="objectInstance" type="Object">The object instance for which the mixins needs to be initialized</param>
		/// </signature>
		if (objectInstance && !objectInstance.__initMixins__) {
			var p = objectInstance, mixins, length, i, mixin, calledMixins = {};
			objectInstance.__initMixins__ = 1;
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//hide __initMixins from VS2012 intellisense
				objectInstance.__initMixins__ = { __hidden: true };
			});
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 
			while (p) {
				p = Object.getPrototypeOf(p);
				if (p && p.hasOwnProperty("__mixins__") && (mixins = p.__mixins__) && (length = mixins.length))
					for (i = 0; mixin = mixins[i], i < length; i++) {
						//WAssert(true, window.intellisense && function WAssert() {
						//	//for correct VS2012 intellisense, at the time of mixin declaration we need to execute new mixin() rather than mixin.call(objectInstance, p, p.constructor) otherwise the glyph icons will look like they are defined on mixin / prototype rather than on the mixin itself
						//	if (!(mixin in calledMixins)) {
						//		calledMixins[mixin] = 1;
						//		new mixin(p, p.constructor);
						//	}
						//});
						if (!(mixin in calledMixins)) {
							calledMixins[mixin] = 1;
							mixin.call(objectInstance, p, p.constructor);
						}
					}
			}
			objectInstance.__initMixins__ = undefined;
		}
	};;

	if (Object_defineProperties) {
		var o = {
			0: [Function, "initMixins", "define", "abstract"],
			1: [Function_prototype, "fastClass", "inheritWith", "define", "defineStatic"]
		}
		for (var p in o)
			for (var props = o[p], obj = props[0], i = 1, prop; prop = props[i], i < props.length; i++) {
				Object_defineProperty(obj, prop, { enumerable: false, value: obj[prop] });
			}
	}



  // Baseline setup
  // --------------

  // Stores whether the object is being initialized. i.e., whether
  // to run the `init` function, or not.
  var initializing = false,

  // Keep a few prototype references around - for speed access,
  // and saving bytes in the minified version.
    ArrayProto = Array.prototype,

  // Save the previous value of `Fiber`.
    previousFiber = global.Fiber;

  // Helper function to copy properties from one object to the other.
  function copy( from, to ) {
    var name;
    for( name in from ) {
      if( from.hasOwnProperty( name ) ) {
        to[name] = from[name];
      }
    }
  }

  // The base `Fiber` implementation.
  function Fiber(){};

  // ###Extend
  //
  // Returns a subclass.
  Fiber.extend = function( fn ) {
    // Keep a reference to the current prototye.
    var parent = this.prototype,

    // Invoke the function which will return an object literal used to define
    // the prototype. Additionally, pass in the parent prototype, which will
    // allow instances to use it.
      properties = fn( parent ),

    // Stores the constructor's prototype.
      proto;

    // The constructor function for a subclass.
    function child(){
      if( !initializing ){
        // Custom initialization is done in the `init` method.
        this.init.apply( this, arguments );
        // Prevent susbsequent calls to `init`.
        // Note: although a `delete this.init` would remove the `init` function from the instance,
        // it would still exist in its super class' prototype.  Therefore, explicitly set
        // `init` to `void 0` to obtain the `undefined` primitive value (in case the global's `undefined`
        // property has been re-assigned).
        this.init = void 0;
      }
    }

    // Instantiate a base class (but only create the instance, without running `init`).
    // and make every `constructor` instance an instance of `this` and of `constructor`.
    initializing = true;
    proto = child.prototype = new this;
    initializing = false;

    // Add default `init` function, which a class may override; it should call the
    // super class' `init` function (if it exists);
    proto.init = function(){
      if ( typeof parent.init === 'function' ) {
        parent.init.apply( this, arguments );
      }
    };

     // Copy the properties over onto the new prototype.
    copy( properties, proto );

    // Enforce the constructor to be what we expect.
    proto.constructor = child;

    // Keep a reference to the parent prototype.
    // (Note: currently used by decorators and mixins, so that the parent can be inferred).
    child.__base__ = parent;

     // Make this class extendable.
    child.extend = Fiber.extend;

    return child;
  };

  // Utilities
  // ---------

  // ###Proxy
  //
  // Returns a proxy object for accessing base methods with a given context.
  //
  // - `base`: the instance' parent class prototype.
  // - `instance`: a Fiber class instance.
  //
  // Overloads:
  //
  // - `Fiber.proxy( instance )`
  // - `Fiber.proxy( base, instance )`
  //
  Fiber.proxy = function( base, instance ) {
    var name,
      iface = {},
      wrap;

    // If there's only 1 argument specified, then it is the instance,
    // thus infer `base` from its constructor.
    if ( arguments.length === 1 ) {
      instance = base;
      base = instance.constructor.__base__;
    }

    // Returns a function which calls another function with `instance` as
    // the context.
    wrap = function( fn ) {
      return function() {
        return base[fn].apply( instance, arguments );
      };
    };

    // For each function in `base`, create a wrapped version.
    for( name in base ){
      if( base.hasOwnProperty( name ) && typeof base[name] === 'function' ){
        iface[name] = wrap( name );
      }
    }
    return iface;
  };

  // ###Decorate
  //
  // Decorate an instance with given decorator(s).
  //
  // - `instance`: a Fiber class instance.
  // - `decorator[s]`: the argument list of decorator functions.
  //
  // Note: when a decorator is executed, the argument passed in is the super class' prototype,
  // and the context (i.e. the `this` binding) is the instance.
  //
  //  *Example usage:*
  //
  //     function Decorator( base ) {
  //       // this === obj
  //       return {
  //         greet: function() {
  //           console.log('hi!');
  //         }
  //       };
  //     }
  //
  //     var obj = new Bar(); // Some instance of a Fiber class
  //     Fiber.decorate(obj, Decorator);
  //     obj.greet(); // hi!
  //
  Fiber.decorate = function( instance /*, decorator[s] */) {
    var i,
      // Get the base prototype.
      base = instance.constructor.__base__,
      // Get all the decorators in the arguments.
      decorators = ArrayProto.slice.call( arguments, 1 ),
      len = decorators.length;

    for( i = 0; i < len; i++ ){
      copy( decorators[i].call( instance, base ), instance );
    }
  };

  // ###Mixin
  //
  // Add functionality to a Fiber definition
  //
  // - `definition`: a Fiber class definition.
  // - `mixin[s]`: the argument list of mixins.
  //
  // Note: when a mixing is executed, the argument passed in is the super class' prototype
  // (i.e., the base)
  //
  // Overloads:
  //
  // - `Fiber.mixin( definition, mix_1 )`
  // - `Fiber.mixin( definition, mix_1, ..., mix_n )`
  //
  // *Example usage:*
  //
  //     var Definition = Fiber.extend(function(base) {
  //       return {
  //         method1: function(){}
  //       }
  //     });
  //
  //     function Mixin(base) {
  //       return {
  //         method2: function(){}
  //       }
  //     }
  //
  //     Fiber.mixin(Definition, Mixin);
  //     var obj = new Definition();
  //     obj.method2();
  //
  Fiber.mixin = function( definition /*, mixin[s] */ ) {
    var i,
      // Get the base prototype.
      base = definition.__base__,
      // Get all the mixins in the arguments.
      mixins = ArrayProto.slice.call( arguments, 1 ),
      len = mixins.length;

    for( i = 0; i < len; i++ ){
      copy( mixins[i]( base ), definition.prototype );
    }
  };

  // ###noConflict
  //
  // Run Fiber.js in *noConflict* mode, returning the `fiber` variable to its
  // previous owner. Returns a reference to the Fiber object.
  Fiber.noConflict = function() {
    global.Fiber = previousFiber;
    return Fiber;
  };

  // Common JS
  // --------------

  // Export `Fiber` to Common JS Loader
  if( typeof module !== 'undefined' ) {
    if( typeof module.setExports === 'function' ) {
      module.setExports( Fiber );
    } else if( module.exports ) {
      module.exports = Fiber;
    }
  } else {
    global.Fiber = Fiber;
  }

// Establish the root object: `window` in the browser, or global on the server.

var Firestorm = {
	extend: function (base, partial) {

		for (var name in partial) {

			base[name] = partial[name];

		}

	},
	implement: function (base, partial) {

		for (var name in partial) {

			if (!(name in base)) {

				base[name] = partial[name];

			}

		}

	},
	_descriptor_to_type: {
		"[object Boolean]": "boolean",
		"[object Number]": "number",
		"[object String]": "string",
		"[object Function]": "function",
		"[object Array]": "array",
		"[object Date]": "date",
		"[object RegExp]": "regexp",
		"[object Object]": "object",
		"[object Error]": "error",
		"[object Null]": "null",
		"[object Undefined]": "undefined"
	},
	getType: function (value) {

		var result = 'null';

		// note: Regexp type may be both an object and a function in different browsers
		if (value !== null) {

			result = typeof(value);
			if (result == "object" || result == "function") {
				// this.toString refers to plain object's toString
				result = this._descriptor_to_type[this.toString.call(value)] || "object";
			}

		}

		return result;

	},
	String: {
		quote_escape_map: {
			"\b": "\\b",
			"\t": "\\t",
			"\n": "\\n",
			"\f": "\\f",
			"\r": "\\r",
			"\"": "\\\"",
			"\\": "\\\\"
		},
		QUOTE_ESCAPE_REGEX: /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		quote: function (string) {

		var result,
			map = this.quote_escape_map;

		if (this.QUOTE_ESCAPE_REGEX.test(string)) {
			result = '"' + string.replace(this.QUOTE_ESCAPE_REGEX, function (a) {
				var c = map[a];
				return typeof c == 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"';
		} else {
			result = '"' + string + '"';
		}

		return result;

	}
	},
	Object: {
		copy: function (object) {

		var result = {};
		Firestorm.extend(result, object);
		return result;

	},
		isEmpty: function (object_instance) {
		// it's much faster than using Object.keys
		//noinspection LoopStatementThatDoesntLoopJS
		for (var name in object_instance) {
			return false;
		}
		return true;
	}
	}
};

var Lava = {
	schema: {DEBUG: true},
	t: function (message) {

		if (typeof(message) == 'number' && this.KNOWN_EXCEPTIONS && (message in this.KNOWN_EXCEPTIONS)) {
			throw new Error(this.KNOWN_EXCEPTIONS[message]);
		}

		throw new Error(message || 'Debug assertion failed');

	},
	VALID_PROPERTY_NAME_REGEX: /^[a-zA-Z\_\$][a-zA-Z0-9\_\$]*$/,
	JS_KEYWORDS: [
		"break",
		"case",
		"catch",
		"class",
		"const",
		"continue",
		"debugger",
		"default",
		"delete",
		"do",
		"else",
		"export",
		"extends",
		"false",
		"finally",
		"for",
		"function",
		"if",
		"import",
		"in",
		"instanceof",
		"new",
		"null",
		"protected",
		"return",
		"super",
		"switch",
		"this",
		"throw",
		"true",
		"try",
		"typeof",
		"var",
		"while",
		"with",
		"abstract",
		"boolean",
		"byte",
		"char",
		"decimal",
		"double",
		"enum",
		"final",
		"float",
		"get",
		"implements",
		"int",
		"interface",
		"internal",
		"long",
		"package",
		"private",
		"protected",
		"public",
		"sbyte",
		"set",
		"short",
		"static",
		"uint",
		"ulong",
		"ushort",
		"void",
		"assert",
		"ensure",
		"event",
		"goto",
		"invariant",
		"namespace",
		"native",
		"require",
		"synchronized",
		"throws",
		"transient",
		"use",
		"volatile"
	],
	ClassManager: null,
	instanceOf: function (instance, class_name) {

		return instance.Class.hierarchy_paths.indexOf(class_name) != -1 || instance.Class.implements.indexOf(class_name) != -1;

	},
	define: function (class_path, source_object) {
				this.ClassManager.define(class_path, source_object);
			}
};
/**
 * Create and manage classes
 */
Lava.ClassManager = {

	/**
	 * Whether to serialize them and inline as a value, when building constructor,
	 * or slice() from original array in original object
	 * @type {boolean}
	 */
	inline_simple_arrays: true,
	/**
	 * In monomorphic mode all value members of classes will be assigned in constructor -
	 * this will produce classes with slow construction time and fast method calls.
	 * If it's is off - then value members will be moved to prototype, and class instance construction will become
	 * significantly faster, but performance of long-living objects will decrease.
	 * @type {boolean}
	 */
	is_monomorphic: true,
	/**
	 * If an array consists of these types - it can be inlined
	 * @type {Array.<string>}
	 */
	SIMPLE_TYPES: ['string', 'boolean', 'number', 'null', 'undefined'],

	/**
	 * Member type IDs in skeleton
	 * @enum {number}
	 */
	MEMBER_TYPES: {
		FUNCTION: 0,
		PRIMITIVE: 1,
		OBJECT: 2,
		STRING: 3,
		REGEXP: 4,
		EMPTY_ARRAY: 5,
		INLINE_ARRAY: 6,
		SLICE_ARRAY: 7
	},

	/**
	 * All data that belongs to each class: everything that's needed for inheritance and building of a constructor
	 * @type {Object.<string, _cClassData>}
	 */
	_sources: {},
	/**
	 * Constructors for each class
	 * @type {Object.<string, function>}
	 */
	constructors: {},
	/**
	 * Special directives, understandable by ClassManager
	 */
	_reserved_members: ['Extends', 'Implements', 'Class', 'Shared'],

	/**
	 * Namespaces, which can hold class constructors
	 * @type {Object.<string, Object>}
	 */
	_root: {},

	/**
	 * Add a namespace, that can contain class constructors
	 * @param {string} name The name of the namespace
	 * @param {Object} object The namespace object
	 */
	registerRootNamespace: function(name, object) {

		this._root[name] = object;

	},

	/**
	 * Get {@link _cClassData} structure for each class
	 * @param {string} class_path
	 * @returns {_cClassData}
	 */
	getClassData: function(class_path) {

		return this._sources[class_path];

	},

	/**
	 * Create a class
	 * @param {string} class_path Full name of the class
	 * @param {Object} source_object Class body
	 */
	define: function(class_path, source_object) {

		var name,
			class_data,
			parent_data,
			i,
			count,
			shared_names,
			is_array,
			type;

		class_data = /** @type {_cClassData} */ {
			name: class_path.split('.').pop(),
			path: class_path,
			source_object: source_object,
			"extends": null,
			"implements": [],
			parent_class_data: null,
			hierarchy_paths: null,
			hierarchy_names: null,
			skeleton: null,
			references: [],
			shared: {},
			constructor: null,
			own_references_count: 0,
			is_monomorphic: this.is_monomorphic
		};

		if ('Extends' in source_object) {

			if (Lava.schema.DEBUG && typeof(source_object.Extends) != 'string') Lava.t('Extends: string expected. ' + class_path);
			class_data['extends'] = /** @type {string} */ source_object.Extends;
			parent_data = this._sources[source_object.Extends];
			class_data.parent_class_data = parent_data;

			if (!parent_data) Lava.t('[define] Base class not found: "' + source_object.Extends + '"');
			if (!parent_data.skeleton) Lava.t("[define] Parent class was loaded without skeleton, extension is not possible: " + class_data['extends']);
			if (parent_data.hierarchy_names.indexOf(class_data.name) != -1) Lava.t("[define] Duplicate name in inheritance chain: " + class_data.name + " / " + class_path);

			class_data.hierarchy_paths = parent_data.hierarchy_paths.slice();
			class_data.hierarchy_paths.push(class_path);
			class_data.hierarchy_names = parent_data.hierarchy_names.slice();
			class_data.hierarchy_names.push(class_data.name);
			class_data.references = parent_data.references.slice();
			class_data.own_references_count -= parent_data.references.length;
			class_data.implements = parent_data.implements.slice();

			for (name in parent_data.shared) {

				is_array = Array.isArray(parent_data.shared[name]);
				class_data.shared[name] = is_array
					? parent_data.shared[name].slice()
					: Firestorm.Object.copy(parent_data.shared[name]);

				if (name in source_object) {

					if (Lava.schema.DEBUG && Array.isArray(source_object[name]) != is_array) Lava.t("Shared members of different types must not override each other (array must not become an object)");
					if (is_array) {
						class_data.shared[name] = source_object[name];
					} else {
						Firestorm.extend(class_data.shared[name], source_object[name]);
					}

				}

			}

		} else {

			class_data.hierarchy_paths = [class_path];
			class_data.hierarchy_names = [class_data.name];

		}

		if ('Shared' in source_object) {

			shared_names = (typeof(source_object.Shared) == 'string') ? [source_object.Shared] : source_object.Shared;

			for (i = 0, count = shared_names.length; i < count; i++) {

				name = shared_names[i];
				type = Firestorm.getType(source_object[name]);

				if (Lava.schema.DEBUG) {
					if (!(name in source_object)) Lava.t("Shared member is not in class: " + name);
					if (type != 'object' && type != 'array') Lava.t("Shared: class member must be an object or array");
					if (class_data.parent_class_data && (name in class_data.parent_class_data.skeleton)) Lava.t("[ClassManager] instance member from parent class may not become shared in descendant: " + name);
					if (name in class_data.shared) Lava.t("Member is already shared in parent class: " + class_path + "#" + name);
				}

				class_data.shared[name] = source_object[name];

			}

		}

		class_data.skeleton = this._disassemble(class_data, source_object, true);

		if (parent_data) {

			this._extend(class_data, class_data.skeleton, parent_data, parent_data.skeleton, true);

		}

		class_data.own_references_count += class_data.references.length;

		if ('Implements' in source_object) {

			if (typeof(source_object.Implements) == 'string') {

				this._implementPath(class_data, source_object.Implements);

			} else {

				for (i = 0, count = source_object.Implements.length; i < count; i++) {

					this._implementPath(class_data, source_object.Implements[i]);

				}

			}

		}

		class_data.constructor = this._buildRealConstructor(class_data);

		this._registerClass(class_data);

	},

	/**
	 * Implement members from another class into current class data
	 * @param {_cClassData} class_data
	 * @param {string} path
	 */
	_implementPath: function(class_data, path) {

		var implements_source = this._sources[path],
			name,
			references_offset;

		if (Lava.schema.DEBUG) {

			if (!implements_source) Lava.t('Implements: class not found - "' + path + '"');
			for (name in implements_source.shared) Lava.t("Implements: unable to use a class with Shared as mixin.");
			if (class_data.implements.indexOf(path) != -1) Lava.t("Implements: class " + class_data.path + " already implements " + path);

		}

		class_data.implements.push(path);
		references_offset = class_data.references.length;
		// array copy is inexpensive, cause it contains only reference types
		class_data.references = class_data.references.concat(implements_source.references);

		this._extend(class_data, class_data.skeleton, implements_source, implements_source.skeleton, true, references_offset);

	},

	/**
	 * Perform extend/implement operation
	 * @param {_cClassData} child_data
	 * @param {Object} child_skeleton The skeleton of a child object
	 * @param {_cClassData} parent_data
	 * @param {Object} parent_skeleton The skeleton of a parent object
	 * @param {boolean} is_root <kw>true</kw>, when extending skeletons class bodies, and <kw>false</kw> in all other cases
	 * @param {number} [references_offset] Also acts as a sign of 'implements' mode
	 */
	_extend: function (child_data, child_skeleton, parent_data, parent_skeleton, is_root, references_offset) {

		var parent_descriptor,
			name,
			new_name,
			parent_type;

		for (name in parent_skeleton) {

			parent_descriptor = parent_skeleton[name];
			parent_type = parent_descriptor.type;

			if (name in child_skeleton) {

				if (is_root && (child_skeleton[name].type == this.MEMBER_TYPES.FUNCTION ^ parent_type == this.MEMBER_TYPES.FUNCTION)) {
					Lava.t('Extend: functions in class root are not replaceable with other types (' + name + ')');
				}

				if (parent_type == this.MEMBER_TYPES.FUNCTION) {

					if (!is_root || typeof(references_offset) != 'undefined') continue;

					new_name = parent_data.name + '$' + name;
					if (new_name in child_skeleton) Lava.t('[ClassManager] Assertion failed, function already exists: ' + new_name);
					child_skeleton[new_name] = parent_descriptor;

				} else if (parent_type == this.MEMBER_TYPES.OBJECT) {

					this._extend(child_data, child_skeleton[name].skeleton, parent_data, parent_descriptor.skeleton, false, references_offset);

				}

			} else if (parent_type == this.MEMBER_TYPES.OBJECT) {

				child_skeleton[name] = {type: this.MEMBER_TYPES.OBJECT, skeleton: {}};
				this._extend(child_data, child_skeleton[name].skeleton, parent_data, parent_descriptor.skeleton, false, references_offset);

			} else if (
				references_offset &&
				(
					parent_type == this.MEMBER_TYPES.FUNCTION
					|| parent_type == this.MEMBER_TYPES.SLICE_ARRAY
					|| parent_type == this.MEMBER_TYPES.REGEXP
				)
			) {

				child_skeleton[name] = {type: parent_type, index: parent_descriptor.index + references_offset};

			} else {

				child_skeleton[name] = parent_descriptor;

			}

		}

	},

	/**
	 * Recursively create skeletons for all objects inside class body
	 * @param {_cClassData} class_data
	 * @param {Object} source_object
	 * @param {boolean} is_root
	 * @returns {Object}
	 */
	_disassemble: function(class_data, source_object, is_root) {

		var name,
			skeleton = {},
			value,
			type,
			skeleton_value;

		for (name in source_object) {

			if (is_root && (this._reserved_members.indexOf(name) != -1 || (name in class_data.shared))) {

				continue;

			}

			value = source_object[name];
			type = Firestorm.getType(value);

			switch (type) {
				case 'null':
				case 'boolean':
				case 'number':
					skeleton_value = {type: this.MEMBER_TYPES.PRIMITIVE, value: value};
					break;
				case 'string':
					skeleton_value = {type: this.MEMBER_TYPES.STRING, value: value};
					break;
				case 'function':
					skeleton_value = {type: this.MEMBER_TYPES.FUNCTION, index: class_data.references.length};
					class_data.references.push(value);
					break;
				case 'regexp':
					skeleton_value = {type: this.MEMBER_TYPES.REGEXP, index: class_data.references.length};
					class_data.references.push(value);
					break;
				case 'object':
					skeleton_value = {
						type: this.MEMBER_TYPES.OBJECT,
						skeleton: this._disassemble(class_data, value, false)
					};
					break;
				case 'array':
					if (value.length == 0) {
						skeleton_value = {type: this.MEMBER_TYPES.EMPTY_ARRAY};
					} else if (this.inline_simple_arrays && this.isInlineArray(value)) {
						skeleton_value = {type: this.MEMBER_TYPES.INLINE_ARRAY, value: value};
					} else {
						skeleton_value = {type: this.MEMBER_TYPES.SLICE_ARRAY, index: class_data.references.length};
						class_data.references.push(value);
					}
					break;
				case 'undefined':
					Lava.t("[ClassManager] Forced code style restriction: please, replace undefined member values with null. Member name: " + name);
					break;
				default:
					Lava.t("[ClassManager] Unsupported property type in source object: " + type);
					break;
			}

			skeleton[name] = skeleton_value;

		}

		return skeleton;

	},

	/**
	 * Build class constructor that can be used with the <kw>new</kw> keyword
	 * @param {_cClassData} class_data
	 * @returns {function} The class constructor
	 */
	_buildRealConstructor: function(class_data) {

		var prototype = {},
			skeleton = class_data.skeleton,
			serialized_value,
			constructor_actions = [],
			name,
			source,
			constructor,
			object_properties,
			uses_references = false,
			is_monomorphic = class_data.is_monomorphic;

		for (name in skeleton) {

			switch (skeleton[name].type) {
				case this.MEMBER_TYPES.STRING:
					if (is_monomorphic) {
						serialized_value = Firestorm.String.quote(skeleton[name].value);
					} else {
						prototype[name] = skeleton[name].value;
					}
					break;
				case this.MEMBER_TYPES.PRIMITIVE: // null, boolean, number
					if (is_monomorphic) {
						serialized_value = skeleton[name].value + '';
					} else {
						prototype[name] = skeleton[name].value;
					}
					break;
				case this.MEMBER_TYPES.EMPTY_ARRAY:
					serialized_value = "[]";
					break;
				case this.MEMBER_TYPES.INLINE_ARRAY:
					serialized_value = this._serializeInlineArray(skeleton[name].value);
					break;
				case this.MEMBER_TYPES.REGEXP:
				case this.MEMBER_TYPES.FUNCTION:
					prototype[name] = class_data.references[skeleton[name].index];
					break;
				case this.MEMBER_TYPES.SLICE_ARRAY:
					serialized_value = 'r[' + skeleton[name].index + '].slice()';
					uses_references = true;
					break;
				case this.MEMBER_TYPES.OBJECT:
					object_properties = [];
					if (this._serializeSkeleton(skeleton[name].skeleton, class_data, "\t", object_properties)) {
						uses_references = true;
					}
					serialized_value = object_properties.length
						? "{\n\t" + object_properties.join(",\n\t") + "\n}"
						: "{}";
					break;
				default:
					Lava.t("[_buildRealConstructor] unknown property descriptor type: " + skeleton[name].type);
			}

			if (serialized_value) {

				if (Lava.VALID_PROPERTY_NAME_REGEX.test(name)) {

					constructor_actions.push('this.' + name + ' = ' + serialized_value);

				} else {

					constructor_actions.push('this[' + Firestorm.String.quote(name) + '] = ' + serialized_value);

				}

				serialized_value = null;

			}

		}

		for (name in class_data.shared) {

			prototype[name] = class_data.shared[name];

		}

		prototype.Class = class_data;

		source = (uses_references ? ("var r=this.Class.references;\n") : '')
			+ constructor_actions.join(";\n")
			+ ";";

		if (class_data.skeleton.init) {

			source += "\nthis.init.apply(this, arguments);";

		}

		constructor = new Function(source);
		// for Chrome we could assign prototype object directly,
		// but in Firefox this will result in performance degradation
		Firestorm.extend(constructor.prototype, prototype);
		return constructor;

	},

	/**
	 * Perform special class serialization, that takes functions and resources from class data and can be used in constructors
	 * @param {Object} skeleton
	 * @param {_cClassData} class_data
	 * @param {string} padding
	 * @param {Array} serialized_properties
	 * @returns {boolean} <kw>true</kw>, if object uses {@link _cClassData#references}
	 */
	_serializeSkeleton: function(skeleton, class_data, padding, serialized_properties) {

		var name,
			serialized_value,
			uses_references = false,
			object_properties;

		for (name in skeleton) {

			switch (skeleton[name].type) {
				case this.MEMBER_TYPES.STRING:
					serialized_value = Firestorm.String.quote(skeleton[name].value);
					break;
				case this.MEMBER_TYPES.PRIMITIVE: // null, boolean, number
					serialized_value = skeleton[name].value + '';
					break;
				case this.MEMBER_TYPES.REGEXP:
				case this.MEMBER_TYPES.FUNCTION:
					serialized_value = 'r[' + skeleton[name].index + ']';
					uses_references = true;
					break;
				case this.MEMBER_TYPES.EMPTY_ARRAY:
					serialized_value = "[]";
					break;
				case this.MEMBER_TYPES.INLINE_ARRAY:
					serialized_value = this._serializeInlineArray(skeleton[name].value);
					break;
				case this.MEMBER_TYPES.SLICE_ARRAY:
					serialized_value = 'r[' + skeleton[name].index + '].slice()';
					uses_references = true;
					break;
				case this.MEMBER_TYPES.OBJECT:
					object_properties = [];
					if (this._serializeSkeleton(skeleton[name].skeleton, class_data, padding + "\t", object_properties)) {
						uses_references = true;
					}
					serialized_value = object_properties.length
						? "{\n\t" + padding + object_properties.join(",\n\t" + padding) + "\n" + padding + "}" : "{}";
					break;
				default:
					Lava.t("[_serializeSkeleton] unknown property descriptor type: " + skeleton[name].type);
			}

			if (Lava.VALID_PROPERTY_NAME_REGEX.test(name) && Lava.JS_KEYWORDS.indexOf(name) == -1) {

				serialized_properties.push(name + ': ' + serialized_value);

			} else {

				serialized_properties.push(Firestorm.String.quote(name) + ': ' + serialized_value);

			}

		}

		return uses_references;

	},

	/**
	 * Get namespace for a class constructor
	 * @param {Array.<string>} path_segments Path to the namespace of a class. Must start with one of registered roots
	 * @returns {Object}
	 */
	_getNamespace: function(path_segments) {

		var namespace,
			segment_name,
			count = path_segments.length,
			i = 1;

		if (!count) Lava.t("ClassManager: class names must include a namespace, even for global classes.");
		if (!(path_segments[0] in this._root)) Lava.t("[ClassManager] namespace is not registered: " + path_segments[0]);
		namespace = this._root[path_segments[0]];

		for (; i < count; i++) {

			segment_name = path_segments[i];

			if (!(segment_name in namespace)) {

				namespace[segment_name] = {};

			}

			namespace = namespace[segment_name];

		}

		return namespace;

	},

	/**
	 * Get class constructor
	 * @param {string} class_path Full name of a class, or a short name (if namespace is provided)
	 * @param {string} [default_namespace] The default prefix where to search for the class, like <str>"Lava.widget"</str>
	 * @returns {function}
	 */
	getConstructor: function(class_path, default_namespace) {

		if (!(class_path in this.constructors) && default_namespace) {

			class_path = default_namespace + '.' + class_path;

		}

		return this.constructors[class_path];

	},

	/**
	 * Whether to inline or slice() an array in constructor
	 * @param {Array} items
	 * @returns {boolean}
	 */
	isInlineArray: function(items) {

		var result = true,
			i = 0,
			count = items.length;

		for (; i < count; i++) {

			if (this.SIMPLE_TYPES.indexOf(Firestorm.getType(items[i])) == -1) {
				result = false;
				break;
			}

		}

		return result;

	},

	/**
	 * Serialize an array which contains only certain primitive types from `SIMPLE_TYPES` property
	 *
	 * @param {Array} data
	 * @returns {string}
	 */
	_serializeInlineArray: function(data) {

		var tempResult = [],
			i = 0,
			count = data.length,
			type,
			value;

		for (; i < count; i++) {

			type = Firestorm.getType(data[i]);
			switch (type) {
				case 'string':
					value = Firestorm.String.quote(data[i]);
					break;
				case 'null':
				case 'undefined':
				case 'boolean':
				case 'number':
					value = data[i] + '';
					break;
				default:
					Lava.t();
			}
			tempResult.push(value);

		}

		return '[' + tempResult.join(", ") + ']';

	},

	/**
	 * Register an existing function as a class constructor for usage with {@link Lava.ClassManager#getConstructor}()
	 * @param {string} class_path Full class path
	 * @param {function} constructor Constructor instance
	 */
	registerExistingConstructor: function(class_path, constructor) {

		if (class_path in this._sources) Lava.t('Class "' + class_path + '" is already defined');
		this.constructors[class_path] = constructor;

	},

	/**
	 * Does a constructor exists
	 * @param {string} class_path Full class path
	 * @returns {boolean}
	 */
	hasConstructor: function(class_path) {

		return class_path in this.constructors;

	},

	/**
	 * Does a class exists
	 * @param {string} class_path
	 * @returns {boolean}
	 */
	hasClass: function(class_path) {

		return class_path in this._sources;

	},

	/**
	 * Build a function that creates class constructor's prototype. Used in export
	 * @param {_cClassData} class_data
	 * @returns {function}
	 */
	_getPrototypeGenerator: function(class_data) {

		var skeleton = class_data.skeleton,
			name,
			serialized_value,
			serialized_actions = [],
			is_polymorphic = !class_data.is_monomorphic;

		for (name in skeleton) {

			switch (skeleton[name].type) {
				case this.MEMBER_TYPES.REGEXP:
				case this.MEMBER_TYPES.FUNCTION:
					serialized_value = 'r[' + skeleton[name].index + ']';
					break;
				//case 'undefined':
				case this.MEMBER_TYPES.STRING:
					if (is_polymorphic) {
						serialized_value = '"' + skeleton[name].value.replace(/\"/g, "\\\"") + '"';
					}
					break;
				case this.MEMBER_TYPES.PRIMITIVE: // null, boolean, number
					if (is_polymorphic) {
						serialized_value = skeleton[name].value + '';
					}
					break;
			}

			if (serialized_value) {

				if (Lava.VALID_PROPERTY_NAME_REGEX.test(name)) {

					serialized_actions.push('p.' + name + ' = ' + serialized_value + ';');

				} else {

					serialized_actions.push('p[' + Firestorm.String.quote(name) + '] = ' + serialized_value + ';');

				}

				serialized_value = null;

			}

		}

		for (name in class_data.shared) {

			serialized_actions.push('p.' + name + ' = s.' + name + ';');

		}

		return serialized_actions.length
			? new Function('cd,p', "\tvar r=cd.references,\n\t\ts=cd.shared;\n\n\t" + serialized_actions.join('\n\t') + "\n")
			: null;

	},

	/**
	 * Server-side export function: create an exported version of a class, which can be loaded by
	 * {@link Lava.ClassManager#loadClass} to save time on client. <b>Warning: export produces lots of excessive data,
	 * which you should manually <kw>delete</kw></b> (read the reference for more info)
	 * @param {string} class_path
	 * @returns {_cClassData}
	 */
	exportClass: function(class_path) {

		var class_data = this._sources[class_path],
			shared = {},
			name,
			result,
			implements_list,
			prototype_generator = this._getPrototypeGenerator(class_data);

		for (name in class_data.shared) {

			if (name in class_data.source_object) {

				shared[name] = class_data.source_object[name];

			}

		}

		result = {
			path: class_data.path,
			"extends": class_data['extends'],
			"implements": null,

			references: class_data.references,
			constructor: this.constructors[class_path],

			skeleton: class_data.skeleton, // may be deleted, if extension via define() is not needed for this class
			source_object: class_data.source_object // may be safely deleted before serialization
		};

		if (prototype_generator) result.prototype_generator = prototype_generator;
		if (!Firestorm.Object.isEmpty(shared)) result.shared = shared;

		if (class_data.parent_class_data) {

			// cut the parent's data and leave only child's
			result.own_references = class_data.references.slice(
				class_data.parent_class_data.references.length,
				class_data.parent_class_data.references.length + class_data.own_references_count
			);
			implements_list = class_data.implements.slice(class_data.parent_class_data.implements.length);

		} else {

			result.own_references = class_data.references.slice(0, class_data.own_references_count);
			implements_list = class_data.implements;

		}

		if (implements_list.length) result.implements = implements_list;

		return result;

	},

	/**
	 * Load an object, exported by {@link Lava.ClassManager#exportClass}
	 * @param {_cClassData} class_data
	 */
	loadClass: function(class_data) {

		var parent_data,
			name,
			shared,
			i = 0,
			count,
			own_implements;

		if (!class_data.shared) class_data.shared = {};
		if (!class_data.implements) class_data.implements = [];
		own_implements = class_data.implements;
		shared = class_data.shared;
		class_data.name = class_data.path.split('.').pop();

		if (class_data['extends']) {

			parent_data = this._sources[class_data['extends']];
			if (Lava.schema.DEBUG && !parent_data) Lava.t("[loadClass] class parent does not exists: " + class_data['extends']);

			class_data.parent_class_data = parent_data;

			for (name in parent_data.shared) {

				if (!(name in shared)) {

					shared[name] = Array.isArray(parent_data.shared[name])
						? parent_data.shared[name].slice()
						: Firestorm.Object.copy(parent_data.shared[name]);

				} else if (!Array.isArray(shared[name])) {

					Firestorm.implement(shared[name], parent_data.shared[name]);

				}

			}

			class_data.implements = parent_data.implements.concat(class_data.implements);
			class_data.hierarchy_names = parent_data.hierarchy_names.slice();
			class_data.hierarchy_names.push(class_data.name);
			class_data.hierarchy_paths = parent_data.hierarchy_paths.slice();
			class_data.hierarchy_paths.push(class_data.path);

		} else {

			class_data.hierarchy_names = [class_data.name];
			class_data.hierarchy_paths = [class_data.path];
			class_data.parent_class_data = null;

		}

		if (class_data.own_references) {

			class_data.references = parent_data
				? parent_data.references.concat(class_data.own_references)
				: class_data.own_references;

			for (count = own_implements.length; i < count; i++) {

				class_data.references = class_data.references.concat(this._sources[own_implements[i]].references);

			}

		}

		if (class_data.prototype_generator) {
			class_data.prototype_generator(class_data, class_data.constructor.prototype);
			class_data.constructor.prototype.Class = class_data;
		}

		this._registerClass(class_data);

	},

	/**
	 * Batch load exported classes. Constructors, references and skeletons can be provided as separate arrays
	 * @param {Array.<_cClassData>} class_datas
	 */
	loadClasses: function(class_datas) {

		for (var i = 0, count = class_datas.length; i <count; i++) {

			this.loadClass(class_datas[i]);

		}

	},

	/**
	 * Convenience method for loading skeletons, which were exported separately from class bodies
	 * @param {Object.<string, Object>} skeletons_hash Class name => skeleton
	 */
	loadSkeletons: function(skeletons_hash) {

		for (var class_name in skeletons_hash) {
			this._sources[class_name].skeleton = skeletons_hash[class_name];
		}

	},

	/**
	 * Put a newly built class constructor into it's namespace
	 * @param {_cClassData} class_data
	 */
	_registerClass: function(class_data) {

		var class_path = class_data.path,
			namespace_path,
			class_name,
			namespace;

		if ((class_path in this._sources) || (class_path in this.constructors)) Lava.t("Class is already defined: " + class_path);
		this._sources[class_path] = class_data;

		if (class_data.constructor) {

			namespace_path = class_path.split('.');
			class_name = namespace_path.pop();
			namespace = this._getNamespace(namespace_path);

			if ((class_name in namespace) && namespace[class_name] != null) Lava.t("Class name conflict: '" + class_path + "' property is already defined in namespace path");

			this.constructors[class_path] = class_data.constructor;
			namespace[class_name] = class_data.constructor;

		}

	},

	/**
	 * Find a class that begins with `base_path` or names of it's parents, and ends with `suffix`
	 * @param {string} base_path
	 * @param {string} suffix
	 * @returns {function}
	 */
	getPackageConstructor: function(base_path, suffix) {

		if (Lava.schema.DEBUG && !(base_path in this._sources)) Lava.t("[getPackageConstructor] Class not found: " + base_path);

		var path,
			current_class = this._sources[base_path],
			result = null;

		do {

			path = current_class.path + suffix;
			if (path in this.constructors) {

				result = this.constructors[path];
				break;

			}

			current_class = current_class.parent_class_data;

		} while (current_class);

		return result;

	},

	/**
	 * Get all names (full paths) of registered classes
	 * @returns {Array.<string>}
	 */
	getClassNames: function() {

		return Object.keys(this._sources);

	},

	/**
	 * Replace function in a class with new body. Class may be in middle of inheritance chain.
	 * Also replaces old method with <kw>null</kw>.
	 *
	 * @param {Object} instance Current class instance, must be <kw>this</kw>
	 * @param {string} instance_class_name Short name of current class
	 * @param {string} function_name Function to replace
	 * @param {string} new_function_name Name of new method from the prototype
	 * @returns {string} name of the method that was replaced
	 */
	patch: function(instance, instance_class_name, function_name, new_function_name) {

		var cd = instance.Class,
			proto = cd.constructor.prototype,
			names = cd.hierarchy_names,
			i = names.indexOf(instance_class_name),
			count = names.length,
			overridden_name;

		if (Lava.schema.DEBUG && i == -1) Lava.t();

		// find method that belongs to this class body
		for (; i < count; i++) {
			overridden_name = names[i] + "$" + function_name;
			// must not use "in" operator, as function body can be removed and assigned null (see below)
			if (proto[overridden_name]) {
				function_name = overridden_name;
				break;
			}
		}

		proto[function_name] = proto[new_function_name];
		// this plays role when class replaces it's method with parent's method (removes it's own method)
		// and parent also wants to apply patches to the same method (see comment above about the "in" operator)
		proto[new_function_name] = null;
		return function_name;

	}

};

if (typeof module != 'undefined' && module.exports) {

	module.exports = Lava;

} else {

	_global.Lava = Lava;

}

/*
This file was generated by a script.
Please, visit
	https://github.com/kogarashisan/PerfTests
to see the actual source and get link to the latest official test version on jsperf.
*/



// it must be inlined, cause otherwise closure-wrapped classes like TypeScript will have to look it up to the window scope
var THRESHOLD = 99;

var DUMMY_VAR = 0;
var dummy = {
	// this will never be executed
	method: function() {var cache_buster_0000;DUMMY_VAR = 123}
};
// classical John Resig's extend
function __extend(Child, Parent) {var cache_buster_0001;
	var F = function() {var cache_buster_0002; };
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}
// In ClassManager all classes belong to a namespace
Lava.ClassManager.registerRootNamespace("global", typeof window != "undefined" ? window : global);
var __extends = this.__extends || function (d, b) {var cache_buster_0003;
		for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
		function __() {var cache_buster_0004; this.constructor = d; }
		__.prototype = b.prototype;
		d.prototype = new __();
	};
var TypeScriptParent = (function () {var cache_buster_0005;
	function TypeScriptParent(instance_string) {var cache_buster_0006;
		this.counter = 0;
		this.instance_array = [];
		this.instance_string = instance_string;
	}
	TypeScriptParent.prototype.method = function (prevent_inline) {var cache_buster_0007;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	};
	return TypeScriptParent;
})();
var TypeScriptChildA = (function (_super) {var cache_buster_0008;
	__extends(TypeScriptChildA, _super);
	function TypeScriptChildA(instance_string) {var cache_buster_0009;
		_super.call(this, instance_string);
		this.member_a = 1;
	}
	TypeScriptChildA.prototype.method = function () {var cache_buster_0010;
		this.member_a = -this.member_a;
		_super.prototype.method.call(this, false);
	};
	return TypeScriptChildA;
})(TypeScriptParent);
var TypeScriptChildB = (function (_super) {var cache_buster_0011;
	__extends(TypeScriptChildB, _super);
	function TypeScriptChildB(instance_string) {var cache_buster_0012;
		_super.call(this, instance_string);
		this.member_b = -1;
	}
	TypeScriptChildB.prototype.method = function () {var cache_buster_0013;
		this.member_b = -this.member_b;
		_super.prototype.method.call(this, false);
	};
	return TypeScriptChildB;
})(TypeScriptParent);


var NativeParent = function(instance_string) {var cache_buster_0014;
	this.counter = 0;
	this.instance_array = [];
	this.instance_string = instance_string;
};

NativeParent.prototype.method = function (prevent_inline) {var cache_buster_0015;
	if (this.counter > 99)
		this.counter = this.counter / 2;
	else
		this.counter++;
	if (prevent_inline) {
		var i = 0;
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
		for (i = 0; i < 1; i++) dummy.method();
	}
};

var NativeChildA = function(instance_string) {var cache_buster_0016;
	this.member_a = 1;
	NativeParent.call(this, instance_string);
};
__extend(NativeChildA, NativeParent);
NativeChildA.prototype.method = function() {var cache_buster_0017;
	this.member_a = -this.member_a;
	NativeParent.prototype.method.call(this, false);
};

var NativeChildB = function(instance_string) {var cache_buster_0018;
	this.member_b = -1;
	NativeParent.call(this, instance_string);
};
__extend(NativeChildB, NativeParent);
NativeChildB.prototype.method = function() {var cache_buster_0019;
	this.member_b = -this.member_b;
	NativeParent.prototype.method.call(this, false);
};

var JRParent = JRClass.extend({
	init: function(instance_string){var cache_buster_0020;
		this.counter = 0;
		this.instance_array = [];
		this.instance_string = instance_string;
	},
	method: function (prevent_inline) {var cache_buster_0021;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
});

var JRChildA = JRParent.extend({
	init: function(instance_string){var cache_buster_0022;
		this.member_a = 1;
		this._super(instance_string);
	},
	method: function(){var cache_buster_0023;
		this.member_a = -this.member_a;
		return this._super(false);
	}
});

var JRChildB = JRParent.extend({
	init: function(instance_string){var cache_buster_0024;
		this.member_b = -1;
		this._super(instance_string);
	},
	method: function(){var cache_buster_0025;
		this.member_b = -this.member_b;
		return this._super(false);
	}
});

var FiberParent = Fiber.extend(function() {var cache_buster_0026;
	return {
		init: function(instance_string) {var cache_buster_0027;
			this.counter = 0;
			this.instance_array = [];
			this.instance_string = instance_string;
		},
		method: function (prevent_inline) {var cache_buster_0028;
			if (this.counter > 99)
				this.counter = this.counter / 2;
			else
				this.counter++;
			if (prevent_inline) {
				var i = 0;
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
				for (i = 0; i < 1; i++) dummy.method();
			}
		}
	}
});

var FiberChildA = FiberParent.extend(function(base) {var cache_buster_0029;
	return {
		init: function (instance_string) {var cache_buster_0030;
			this.member_a = 1;
			base.init.call(this, instance_string);
		},
		method: function () {var cache_buster_0031;
			this.member_a = -this.member_a;
			base.method.call(this, false);
		}
	}
});

var FiberChildB = FiberParent.extend(function(base) {var cache_buster_0032;
	return {
		init: function (instance_string) {var cache_buster_0033;
			this.member_b = -1;
			base.init.call(this, instance_string);
		},
		method: function () {var cache_buster_0034;
			this.member_b = -this.member_b;
			base.method.call(this, false);
		}
	}
});

var DNW_FC_Parent = Function.define(function(instance_string) {var cache_buster_0035;
	this.counter = 0;
	this.instance_array = [];
	this.instance_string = instance_string;
}, {
	method: function (prevent_inline) {var cache_buster_0036;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
});

var DNW_FC_ChildA = DNW_FC_Parent.fastClass(function(base, baseCtor) {var cache_buster_0037;
	this.constructor = function(instance_string) {var cache_buster_0038;
		this.member_a = 1;
		baseCtor.call(this, instance_string);
	};
	this.method = function() {var cache_buster_0039;
		this.member_a = -this.member_a;
		base.method.call(this, false);
	};
});

var DNW_FC_ChildB = DNW_FC_Parent.fastClass(function(base, baseCtor) {var cache_buster_0040;
	this.constructor = function(instance_string) {var cache_buster_0041;
		this.member_b = -1;
		baseCtor.call(this, instance_string);
	};
	this.method = function() {var cache_buster_0042;
		this.member_b = -this.member_b;
		base.method.call(this, false);
	};
});

var DNW_IW_Parent = Function.define(function(instance_string) {var cache_buster_0043;
	this.counter = 0;
	this.instance_array = [];
	this.instance_string = instance_string;
}, {
	method: function (prevent_inline) {var cache_buster_0044;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
});

var DNW_IW_ChildA = DNW_IW_Parent.inheritWith(function(base, baseCtor) {var cache_buster_0045;
	return {
		constructor: function(instance_string) {var cache_buster_0046;
			this.member_a = 1;
			baseCtor.call(this, instance_string);
		},
		method: function() {var cache_buster_0047;
			this.member_a = -this.member_a;
			base.method.call(this, false);
		}
	}
});

var DNW_IW_ChildB = DNW_IW_Parent.inheritWith(function(base, baseCtor) {var cache_buster_0048;
	return {
		constructor: function(instance_string) {var cache_buster_0049;
			this.member_b = -1;
			baseCtor.call(this, instance_string);
		},
		method: function() {var cache_buster_0050;
			this.member_b = -this.member_b;
			base.method.call(this, false);
		}
	}
});
Lava.ClassManager.is_monomorphic = true;

Lava.ClassManager.define(
"global.CMBrowserMonoParent",
{
	counter: 0,
	instance_array: [],
	instance_string: "",

	init: function(instance_string) {var cache_buster_0051;

		this.instance_string = instance_string;

	},

	method: function (prevent_inline) {var cache_buster_0052;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
});

Lava.ClassManager.define(
"global.CMBrowserMonoChildA",
{
	Extends: "global.CMBrowserMonoParent",
	member_a: 1,
	init: function(instance_string) {var cache_buster_0053;
		this.CMBrowserMonoParent$init(instance_string);
	},
	method: function () {var cache_buster_0054;
		this.member_a = -this.member_a;
		this.CMBrowserMonoParent$method(false);
	}
});

Lava.ClassManager.define(
"global.CMBrowserMonoChildB",
{
	Extends: "global.CMBrowserMonoParent",
	member_b: -1,
	init: function(instance_string) {var cache_buster_0055;
		this.CMBrowserMonoParent$init(instance_string);
	},
	method: function () {var cache_buster_0056;
		this.member_b = -this.member_b;
		this.CMBrowserMonoParent$method(false);
	}
});
Lava.ClassManager.is_monomorphic = false;

Lava.ClassManager.define(
"global.CMBrowserPolyParent",
{
	counter: 0,
	instance_array: [],
	instance_string: "",

	init: function(instance_string) {var cache_buster_0057;

		this.instance_string = instance_string;

	},

	method: function (prevent_inline) {var cache_buster_0058;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
});

Lava.ClassManager.define(
"global.CMBrowserPolyChildA",
{
	Extends: "global.CMBrowserMonoParent",
	member_a: 1,
	init: function(instance_string) {var cache_buster_0059;
		this.CMBrowserMonoParent$init(instance_string);
	},
	method: function () {var cache_buster_0060;
		this.member_a = -this.member_a;
		this.CMBrowserMonoParent$method(false);
	}
});

Lava.ClassManager.define(
"global.CMBrowserPolyChildB",
{
	Extends: "global.CMBrowserMonoParent",
	member_b: -1,
	init: function(instance_string) {var cache_buster_0061;
		this.CMBrowserMonoParent$init(instance_string);
	},
	method: function () {var cache_buster_0062;
		this.member_b = -this.member_b;
		this.CMBrowserMonoParent$method(false);
	}
});
Lava.ClassManager.loadClasses([
	{
		path: "global.CMServerFullrefMonoParent",
		"extends": null,
		"implements": null,
		references: [
			function (instance_string) {var cache_buster_0063;

		this.instance_string = instance_string;

	},
			function (prevent_inline) {var cache_buster_0064;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
		],
		constructor: function() {var cache_buster_0065;
this.counter = 0;
this.instance_array = [];
this.instance_string = "";
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0066;
	var r=cd.references,
		s=cd.shared;

	p.init = r[0];
	p.method = r[1];

}
	},
	{
		path: "global.CMServerFullrefMonoChildA",
		"extends": "global.CMServerFullrefMonoParent",
		"implements": null,
		references: [
			function (instance_string) {var cache_buster_0067;

		this.instance_string = instance_string;

	},
			function (prevent_inline) {var cache_buster_0068;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	},
			function (instance_string) {var cache_buster_0069;
		this.CMServerFullrefMonoParent$init(instance_string);
	},
			function () {var cache_buster_0070;
		this.member_a = -this.member_a;
		this.CMServerFullrefMonoParent$method(false);
	}
		],
		constructor: function() {var cache_buster_0071;
this.member_a = 1;
this.counter = 0;
this.instance_array = [];
this.instance_string = "";
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0072;
	var r=cd.references,
		s=cd.shared;

	p.init = r[2];
	p.method = r[3];
	p.CMServerFullrefMonoParent$init = r[0];
	p.CMServerFullrefMonoParent$method = r[1];

}
	},
	{
		path: "global.CMServerFullrefMonoChildB",
		"extends": "global.CMServerFullrefMonoParent",
		"implements": null,
		references: [
			function (instance_string) {var cache_buster_0073;

		this.instance_string = instance_string;

	},
			function (prevent_inline) {var cache_buster_0074;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	},
			function (instance_string) {var cache_buster_0075;
		this.CMServerFullrefMonoParent$init(instance_string);
	},
			function () {var cache_buster_0076;
		this.member_b = -this.member_b;
		this.CMServerFullrefMonoParent$method(false);
	}
		],
		constructor: function() {var cache_buster_0077;
this.member_b = -1;
this.counter = 0;
this.instance_array = [];
this.instance_string = "";
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0078;
	var r=cd.references,
		s=cd.shared;

	p.init = r[2];
	p.method = r[3];
	p.CMServerFullrefMonoParent$init = r[0];
	p.CMServerFullrefMonoParent$method = r[1];

}
	},
	{
		path: "global.CMServerPartialrefMonoParent",
		"extends": null,
		"implements": null,
		constructor: function() {var cache_buster_0079;
this.counter = 0;
this.instance_array = [];
this.instance_string = "";
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0080;
	var r=cd.references,
		s=cd.shared;

	p.init = r[0];
	p.method = r[1];

},
		own_references: [
			function (instance_string) {var cache_buster_0081;

		this.instance_string = instance_string;

	},
			function (prevent_inline) {var cache_buster_0082;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
		]
	},
	{
		path: "global.CMServerPartialrefMonoChildA",
		"extends": "global.CMServerPartialrefMonoParent",
		"implements": null,
		constructor: function() {var cache_buster_0083;
this.member_a = 1;
this.counter = 0;
this.instance_array = [];
this.instance_string = "";
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0084;
	var r=cd.references,
		s=cd.shared;

	p.init = r[2];
	p.method = r[3];
	p.CMServerPartialrefMonoParent$init = r[0];
	p.CMServerPartialrefMonoParent$method = r[1];

},
		own_references: [
			function (instance_string) {var cache_buster_0085;
		this.CMServerPartialrefMonoParent$init(instance_string);
	},
			function () {var cache_buster_0086;
		this.member_a = -this.member_a;
		this.CMServerPartialrefMonoParent$method(false);
	}
		]
	},
	{
		path: "global.CMServerPartialrefMonoChildB",
		"extends": "global.CMServerPartialrefMonoParent",
		"implements": null,
		constructor: function() {var cache_buster_0087;
this.member_b = -1;
this.counter = 0;
this.instance_array = [];
this.instance_string = "";
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0088;
	var r=cd.references,
		s=cd.shared;

	p.init = r[2];
	p.method = r[3];
	p.CMServerPartialrefMonoParent$init = r[0];
	p.CMServerPartialrefMonoParent$method = r[1];

},
		own_references: [
			function (instance_string) {var cache_buster_0089;
		this.CMServerPartialrefMonoParent$init(instance_string);
	},
			function () {var cache_buster_0090;
		this.member_b = -this.member_b;
		this.CMServerPartialrefMonoParent$method(false);
	}
		]
	},
	{
		path: "global.CMServerPartialrefPolyParent",
		"extends": null,
		"implements": null,
		constructor: function() {var cache_buster_0091;
this.instance_array = [];
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0092;
	var r=cd.references,
		s=cd.shared;

	p.counter = 0;
	p.instance_string = "";
	p.init = r[0];
	p.method = r[1];

},
		own_references: [
			function (instance_string) {var cache_buster_0093;

		this.instance_string = instance_string;

	},
			function (prevent_inline) {var cache_buster_0094;
		if (this.counter > 99)
			this.counter = this.counter / 2;
		else
			this.counter++;
		if (prevent_inline) {
			var i = 0;
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
			for (i = 0; i < 1; i++) dummy.method();
		}
	}
		]
	},
	{
		path: "global.CMServerPartialrefPolyChildA",
		"extends": "global.CMServerPartialrefPolyParent",
		"implements": null,
		constructor: function() {var cache_buster_0095;
this.instance_array = [];
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0096;
	var r=cd.references,
		s=cd.shared;

	p.member_a = 1;
	p.init = r[2];
	p.method = r[3];
	p.counter = 0;
	p.instance_string = "";
	p.CMServerPartialrefPolyParent$init = r[0];
	p.CMServerPartialrefPolyParent$method = r[1];

},
		own_references: [
			function (instance_string) {var cache_buster_0097;
		this.CMServerPartialrefPolyParent$init(instance_string);
	},
			function () {var cache_buster_0098;
		this.member_a = -this.member_a;
		this.CMServerPartialrefPolyParent$method(false);
	}
		]
	},
	{
		path: "global.CMServerPartialrefPolyChildB",
		"extends": "global.CMServerPartialrefPolyParent",
		"implements": null,
		constructor: function() {var cache_buster_0099;
this.instance_array = [];
this.init.apply(this, arguments);
},
		prototype_generator: function(cd,p) {var cache_buster_0100;
	var r=cd.references,
		s=cd.shared;

	p.member_b = -1;
	p.init = r[2];
	p.method = r[3];
	p.counter = 0;
	p.instance_string = "";
	p.CMServerPartialrefPolyParent$init = r[0];
	p.CMServerPartialrefPolyParent$method = r[1];

},
		own_references: [
			function (instance_string) {var cache_buster_0101;
		this.CMServerPartialrefPolyParent$init(instance_string);
	},
			function () {var cache_buster_0102;
		this.member_b = -this.member_b;
		this.CMServerPartialrefPolyParent$method(false);
	}
		]
	}
]);


  var hasIntrospection = (function(){return '_';}).toString().indexOf('_') > -1,
        emptyBase = function() {},
        hasOwnProperty = Object.prototype.hasOwnProperty,
        objCreate = Object.create || function(ptp) {
                  var inheritance = function() {};
                  inheritance.prototype = ptp;
                  return new inheritance();
              },
        objKeys = Object.keys || function(obj) {
                  var res = [];
                  for(var i in obj) {
                                hasOwnProperty.call(obj, i) && res.push(i);
                            }
                  return res;
              },
        extend = function(o1, o2) {
                  for(var i in o2) {
                                hasOwnProperty.call(o2, i) && (o1[i] = o2[i]);
                            }

                  return o1;
              },
        toStr = Object.prototype.toString,
        isArray = Array.isArray || function(obj) {
                  return toStr.call(obj) === '[object Array]';
              },
        isFunction = function(obj) {
                  return toStr.call(obj) === '[object Function]';
              },
        noOp = function() {},
        needCheckProps = true,
        testPropObj = { toString : '' };

  for(var i in testPropObj) { // fucking ie hasn't toString, valueOf in for
        testPropObj.hasOwnProperty(i) && (needCheckProps = false);
  }

  var specProps = needCheckProps? ['toString', 'valueOf'] : null;

  function getPropList(obj) {
        var res = objKeys(obj);
        if(needCheckProps) {
                  var specProp, i = 0;
                  while(specProp = specProps[i++]) {
                                obj.hasOwnProperty(specProp) && res.push(specProp);
                            }
              }

        return res;
  }

  function override(base, res, add) {
        var addList = getPropList(add),
              j = 0, len = addList.length,
              name, prop;
        while(j < len) {
                  if((name = addList[j++]) === '__self') {
                                continue;
                            }
                  prop = add[name];
                  if(isFunction(prop) &&
                                    (!prop.prototype || !prop.prototype.__self) && // check to prevent wrapping of "class" functions
                                      (!hasIntrospection || prop.toString().indexOf('.__base') > -1)) {
                                                    res[name] = (function(name, prop) {
                                                                      var baseMethod = base[name]?
                                                                                base[name] :
                                                                                name === '__constructor'? // case of inheritance from plain function
                                                                                    res.__self.__parent :
                                                                                    noOp,
                                                                            result = function() {
                                                                                                      var baseSaved = this.__base;

                                                                                                      this.__base = result.__base;
                                                                                                      var res = prop.apply(this, arguments);
                                                                                                      this.__base = baseSaved;

                                                                                                      return res;
                                                                                                  };
                                                                      result.__base = baseMethod;

                                                                      return result;
                                                                  })(name, prop);
                                                } else {
                                                    res[name] = prop;
                                                }
              }
  }

  function applyMixins(mixins, res) {
        var i = 1, mixin;
        while(mixin = mixins[i++]) {
                  res?
                        isFunction(mixin)?
                            inherit.self(res, mixin.prototype, mixin) :
                            inherit.self(res, mixin) :
                        res = isFunction(mixin)?
                            inherit(mixins[0], mixin.prototype, mixin) :
                            inherit(mixins[0], mixin);
              }
        return res || mixins[0];
  }

  /**
   * * Creates class
   * * @exports
   * * @param {Function|Array} [baseClass|baseClassAndMixins] class (or class and mixins) to inherit from
   * * @param {Object} prototypeFields
   * * @param {Object} [staticFields]
   * * @returns {Function} class
   * */
  function inherit() {
        var args = arguments,
              withMixins = isArray(args[0]),
              hasBase = withMixins || isFunction(args[0]),
              base = hasBase? withMixins? applyMixins(args[0]) : args[0] : emptyBase,
              props = args[hasBase? 1 : 0] || {},
              staticProps = args[hasBase? 2 : 1],
              res = props.__constructor || (hasBase && base.prototype && base.prototype.__constructor)?
                  function() {
                                    return this.__constructor.apply(this, arguments);
                                } :
                  hasBase?
                      function() {
                                            return base.apply(this, arguments);
                                        } :
                      function() {};

        if(!hasBase) {
                  res.prototype = props;
                  res.prototype.__self = res.prototype.constructor = res;
                  return extend(res, staticProps);
              }

        extend(res, base);

        res.__parent = base;

        var basePtp = base.prototype,
              resPtp = res.prototype = objCreate(basePtp);

        resPtp.__self = resPtp.constructor = res;

        props && override(basePtp, resPtp, props);
        staticProps && override(base, res, staticProps);

        return res;
  }

  inherit.self = function() {
        var args = arguments,
              withMixins = isArray(args[0]),
              base = withMixins? applyMixins(args[0], args[0][0]) : args[0],
              props = args[1],
              staticProps = args[2],
              basePtp = base.prototype;

        props && override(basePtp, basePtp, props);
        staticProps && override(base, base, staticProps);

        return base;
  };

  var defineAsGlobal = true;
  if(typeof exports === 'object') {
        module.exports = inherit;
        defineAsGlobal = false;
  }

  if(typeof modules === 'object' && typeof modules.define === 'function') {
        modules.define('inherit', function(provide) {
                  provide(inherit);
              });
        defineAsGlobal = false;
  }

  if(typeof define === 'function') {
        define(function(require, exports, module) {
                  module.exports = inherit;
              });
        defineAsGlobal = false;
  }


// base "class" 
var inheritBase = inherit(/** @lends A.prototype */{
    __constructor : function(instance_string) { // constructor 
        var cachbuster2009;
        this.counter = 0;
        this.instance_array = [];
        this.instance_string = instance_string;
    },
 
    method : function(prevent_inline) {
          var cachbuster1006;
          if (this.counter > 99 ) this.counter = this.counter / 2;
          else this.counter++;
          if (prevent_inline) {
                  var i = 0;
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                }
        }
});

var inheritA = inherit(inheritBase, {
    __constructor : function(instance_string) {
      var cachbuster1000;
      inheritBase.prototype.__constructor.call(this, instance_string);
      this.member_a = 1;
    },
    method : function(prevent_inline) {var cachbuster2001;
      inheritBase.prototype.method.call(this, false);
      this.member_a = -this.member_a;
    }
});

var inheritB = inherit(inheritBase, {
    __constructor : function(instance_string) {
      var cachbuster1000;
      inheritBase.prototype.__constructor.call(this, instance_string);
      this.member_b = 1;
    },
    method : function(prevent_inline) {var cachbuster2001;
      inheritBase.prototype.method.call(this, false);
      this.member_b = -this.member_b;
    }
});

var earth = require('./oo.js');
var class_34rth = earth.core.object.extend(function(_super) {
    this.__init = function(instance_string) {
          var cachbuster1009;
          this.counter = 0;
          this.instance_array = [];
          this.instance_string = instance_string;
        };

    this.method = function(prevent_inline) {
          var cachbuster1006;
          if (this.counter > 99 ) this.counter = this.counter / 2;
          else this.counter++;
          if (prevent_inline) {
                  var i = 0;
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                  for (i = 0; i < 1; i++) dummy.method();
                }
        };
});

var subclass_34rthA = class_34rth.extend(function(_super) {
    this.__init = function(instance_string) {
      var cachbuster1000;
      _super.__init.call(this, instance_string);
      this.member_a = 1;
    };
    this.method = function(prevent_inline) {var cachbuster1001; 
      _super.method.call(this, false);
      this.member_a = -this.member_a;
    };
});

var subclass_34rthB = class_34rth.extend(function(_super) {
    this.__init = function(instance_string) {
      var cachbuster1002;
      _super.__init.call(this, instance_string);
      this.member_b = 1;
    };
    this.method = function(prevent_inline) {
      var cachbuster1003;
      _super.method.call(this, false);
      this.member_b = -this.member_b;
    };
});

Number.prototype.format = function(n, x) {
      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
      return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};
var timer = earth.core.object.extend(new function(){
  this.timers = [];
  this.last_time = null;

  this.__init = function(){
    this.timers = [];
  };

  this.start = function(){
    this.timers.push(process.hrtime());
  };

  this.stop = function(){
    var start = this.timers.pop();
    var diff = process.hrtime(start);
    this.last_time = (diff[0] * 1e9 + diff[1])/1000/1000;
    return this.last_time;
  };

  this.get_last_time = function(){
    return this.last_time;
  };
});

timer = new timer();

var classes = {};
classes.TypeScriptChild = [TypeScriptChildA, TypeScriptChildB, [], []];
classes.CMBrowserMonoChild = [CMBrowserMonoChildA, CMBrowserMonoChildB, [],[]];
classes.CMBrowserPolyChild = [CMBrowserPolyChildA, CMBrowserPolyChildB, [],[]];
classes.CMServerFullrefMonoChild = [CMServerFullrefMonoChildA, CMServerFullrefMonoChildB, [],[]];
classes.CMServerPartialrefMonoChild = [CMServerPartialrefMonoChildA, CMServerPartialrefMonoChildB, [],[]];
classes.FiberChild = [FiberChildA, FiberChildB, [],[]];
//classes.DNW_FC_Child = [DNW_FC_ChildA, DNW_FC_ChildB, [],[]];
//classes.DNW_IW_Child = [DNW_IW_ChildA, DNW_IW_ChildB, [],[]];
classes.JRChild = [JRChildA, JRChildB, [],[]];
classes.NativeChild = [NativeChildA, NativeChildB, [],[]];
classes.inherit = [inheritA, inheritB, [],[]];
classes.subclass_34rth = [subclass_34rthA, subclass_34rthB, [],[]];

var iterations_array = [100*1000,1000*1000, 10*1000*1000];
var iterations = null;

for(i in iterations_array){
  var iterations = iterations_array[i];
  for(var c in classes){
    timer.start();
    for(var j = 0;j<iterations;j++){
      new classes[c][0]('a');
      new classes[c][1]('b');
    }
    classes[c][2].push(timer.stop());
    var instance = new classes[c][0]('a');
    timer.start();
    for(var j = 0;j<iterations;j++){
      instance.method();
    }
    classes[c][3].push(timer.stop());
  }
}
var instantiation = '';
var method = '';
var iterations_string = '| Library | ';
var separator_string = ' | --- | ';
var combined = '';
for(i in iterations_array){
  iterations_string += iterations_array[i].format() + ' | ';
	separator_string += '--- | ';
}

for(var c in classes){
  instantiation += '| ' + c + ' | ';
  method += '| ' + c + ' | ';
  combined += '| ' + c + ' | ';
  for(i in iterations_array){
    var iterations = iterations_array[i];
    instantiation += classes[c][2][i].format()+ ' | ';
    method += classes[c][3][i].format() + ' | ';
    combined += ((classes[c][2][i] + classes[c][3][i])/2).format() + ' | ';
  }
  instantiation += '\n';
  method += '\n';
  combined += '\n';
}

console.log('### Object INSTANTIATION'); 
console.log(iterations_string);
console.log(separator_string);
console.log(instantiation);
console.log('\n\n### METHOD Invocation');
console.log(iterations_string);
console.log(separator_string);
console.log(method);
console.log('\n\n### COMBINED Statistics');
console.log(iterations_string);
console.log(separator_string);
console.log(combined);
return;
