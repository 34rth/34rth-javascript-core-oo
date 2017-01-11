"use strict";
if(!require) var require = function(path, module){return module};

/*
 * earth.core.object powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

var earth = {
    core:{
        object : function () {}
    }
};

earth.core.object.prototype.__id__ = 'earth.core.object';

/**
  * When extending:
  *     STATICS
  *     statics is a convenience property that injects specified object properties as the static properties of the object:
  *
  *     var my_object = earth.core.object.extend({
  *       statics:{
  *         foo:5
  *       }
  *       this.add = function(obj){
  *         this.cache.push(obj)
  *       }
  *     });
  *     my_instance = new my_object();
  *
  *     OR
  *
  *     var my_object = earth.core.object.extend(new function(){
  *       this.statics = {};
  *       this.statics.foo = 5;
  *
  *       this.add = function(obj){
  *         this.cache.push(obj);
  *       };
  *     });
  *
  *     console.log(my_object.foo); -> 5
  *     console.log(my_instance.constructor.foo); -> 5
  *
  *     console.log(my_object.statics.foo -> TypeError 
  *     console.log(my_instance.foo) -> undefined
  *     console.log(my_instance.statics.foo); -> TypeError
  *     
  *     OPTIONS
  *     options is a special property that unlike other objects that you pass to extend will be merged with the parent one instead of overriding it completely, which makes managing configuration of objects and default values convenient:
  *
  *     var Myobject = L.object.extend({
  *       options: {
  *         myOption1: 'foo',
  *         myOption2: 'bar'
  *       }
  *     });
  *
  *     var MyChildobject = Myobject.extend({
  *       options: {
  *         myOption1: 'baz',
  *         myOption3: 5
  *       }
  *     });
  *
  *     var a = new MyChildobject();
  *     a.options.myOption1; // 'baz'
  *     a.options.myOption2; // 'bar'
  *     a.options.myOption3; // 5
  */
earth.core.object.extend = function (skeleton, options) {
  if(skeleton instanceof Function) skeleton = new skeleton(this.prototype);
  var options = options?options:{};

  var base = this;
  var derived = null;
  
  var derived;
  if(options.no_sugar){
    derived = skeleton.__init||function(){};
  }else{
    derived = function(){
      if(this.__complex_member_variables__){
        var l = this.__complex_member_variables__.length;
        for(var i = 0; i<l; i++){
        	this[this.__complex_member_variables__[i]] =  earth.core.utils.clone(this[this.__complex_member_variables__[i]], true);
        }
      }
      this.__init.apply(this, arguments);
      if(this.__init_hooks__) this.__call_init_hooks__();
    };
  }
  derived.prototype = earth.core.utils.create(base.prototype); 
  derived.prototype.__init = derived.prototype.__init || function(){};

  if(skeleton.__id__ && Object.defineProperty) Object.defineProperty(derived, "name", { value:(skeleton.__id__ || '').replace(/\W/g, '_')});

  //inherit parent's statics
  for (var i in this) {
    if (this.hasOwnProperty(i) && i !== 'prototype'){ 
      derived[i] = this[i];
    }
  }
  
  //init hooks definition so mixins won't propagete init hooks to parents (if this is not defined before including mixin aspects __init_hooks of parent class will be used
  // add method for calling all init hooks
  derived.prototype.__call_init_hooks__ = function () {
    if (this.__init_hooks_called__) { return; }
    derived.prototype.__init_hooks__ = (derived.prototype.__init_hooks__)?derived.prototype.__init_hooks__:[];
    
    if (base.prototype.__call_init_hooks__) {
      base.prototype.__call_init_hooks__.call(this);
    }

    for (var i = 0, len = derived.prototype.__init_hooks__.length; i < len; i++) {
      derived.prototype.__init_hooks__[i].call(this, base.prototype);
    }

    this.__init_hooks_called__ = true;
  };

  // mix static skeleton into the object
  if(skeleton.statics) {
    derived = earth.core.utils.extend(derived, skeleton.statics);
    delete skeleton.statics;
  }

  //mix includes into the prototype, i.e. aspects of mixins
  if (skeleton.includes) {
    if(skeleton.includes instanceof Array){
      var index,len;
      for(index = 0,len=skeleton.includes.length;index<len;index++){
        derived.include(skeleton.includes[index]);
      }
    }else{
      derived.include(skeleton.includes);
    }
    delete skeleton.includes;
  }
  
  // merge options
  if(derived.prototype.options) {
    derived.prototype.options = earth.core.utils.extend(earth.core.utils.create(derived.prototype.options), skeleton.options);
  }
	
  // mix given skeleton into the prototype
  derived.prototype = earth.core.utils.extend(derived.prototype, skeleton); 
	// very slow this.super implementation
  if(options.super){
	  for (var name in skeleton) {
      if(typeof skeleton[name] === 'function'){
        if(base.prototype[name]){
          derived.prototype[name] = (function(name, fn){
            return function() {
              this.super = base.prototype[name];
              return fn.apply(this, arguments);
            };
          })(name, skeleton[name]);
        }
  		} 
  	}
  }

  //checking for complex values in prototype
  var complex_members = [];
  for(var p in derived.prototype){
    if(typeof derived.prototype[p] === 'object' && derived.prototype[p] !== null){
      switch(p){
        case '__init_hooks__':
        case '__complex_member_variables__':
          break;
        default:
          complex_members.push(p);
          break;
      }
    }else if(typeof derived.prototype[p] === 'function'  && base.prototype[p] && derived.prototype[p] != base.prototype[p]){
      switch(p){
        case '__call_init_hooks__':
          break;
        default:
         // derived.prototype[p].base = base.prototype[p];
          break;
      }
    }
  }

  if(complex_members.length > 0){
    console.info(derived.prototype.__id__ + ': implements complex objects as a member variables (' + complex_members.join(', ') + ').');
    if(options.complex_member_variables===undefined){//i.e. if implementer is potentially not aware of consequences, warn with consequences
      console.warn(derived.prototype.__id__ + ': Complex member cloning will be enforced. If you would like to avoid this behaviour, please initiate the member variable in the constructor (__init) or set complex_member_variable to false. The consequence of setting complex_members_variables to false is that complex members will be shared across all instances and modifying a complex member variable will result in the change being visible in all other instances.');
    }
    //setting the complex member variable if complex member variables have not been explicitly set to false
    derived.prototype.__complex_member_variables__ = (true && (options.complex_member_variables!== false))?complex_members:false;
  }

  return derived;
};

// method for adding properties to prototype
earth.core.object.include = function(props){
  if(!earth.core.mixin){console.error('Mixins (class earth.core.mixin) are not defined');return false;}
  if(!props){console.error('Trying to include non-existing object as a mixin');return false;}
  if(!props instanceof earth.core.mixin){console.warn('Trying to include a non Mixin object');}

  //include static properties
  for(var prop in props){
    //we are not overwriting the extend method as mixins have a different extend method!
    if( 
      prop != 'extend' &&
      prop != 'superclass' &&
      prop != 'prototype' &&
      prop != 'add_init_hook'
    ){
      if(this[prop]){
        console.warn('Static method/property ' + prop + ' is shadowed/overwritten in ' + this.prototype.__id__ + ' by ' + props.prototype.__id__ + '. This might lead to unforseen behaviour. Inherit method is keeping the original to allow for local static extension/shadowing.');
      }else{
        this[prop] = props[prop];
      }
    }
  }

  // include prototype methods
  var props = (props.prototype)?props.prototype:function(){};
  //we wanna know what the leaf methods/properties are
  var this_props = Object.keys(this.prototype);
  //TODO: implement indexed array (k => v) to avoid naming conflicts between mixings. this way mixins can be ID'd/labeled and the respective function names prefixed
  while(props){
    for(var prop in props){
      switch(prop){
        case '__init_hooks__':
          for(var hook in props[prop]){
            this.add_init_hook(props[prop][hook]);
          }
          break;
        case 'options':
          this.prototype.options = earth.core.utils.extend(props[prop], this.prototype.options);
          break;
        case 'constructor':
        case '__init':
        case '__id__'://custom ID for each class/object
          //do nothing
          break;
        default:
          //if the prototype already has this method and since we're propagating upwards, we do not overwrite the respective property, otherwise we would be overwriting child methods/properties (shadowing) with parent methods/properties.
          if(this.prototype[prop]){
            //we only log/warn in case it's not an inherited method, but an explicitly defined method/property -> otherwise we'll run in the risk of having many warnings up the inheritance chain of mixins.
            if(this_props.indexOf(prop)!= -1){
              console.error('Instance method/property ' + prop + ' is shadowed/overwritten by mixin. This might lead to unforseen behaviour. Inherit method is using the local method/function to allow for local instance extension/shadowing.');
            }
          }else{
            this.prototype[prop] = props[prop];
          }
      }
    }
    props = (props.prototype)?props.prototype:props.__proto__;
  }
  return true;
};


// merge new default options to the object
earth.core.object.merge_options = function(options){
  this.prototype.options = earth.core.utils.extend(this.prototype.options, options);
};

// add a constructor hook
earth.core.object.add_init_hook = function (fn) { // (Function) || (String, args...)
  var args = Array.prototype.slice.call(arguments, 1);

  var init = typeof fn === 'function' ? fn : function () {
    this[fn].apply(this, args);
  };

  this.prototype.__init_hooks__ = this.prototype.__init_hooks__ || [];
  this.prototype.__init_hooks__.push(init);
};

earth.core.object.prototype.equals = function(obj){
    return (obj === this);
};
"use strict";
earth.core.utils = new (function(){
  this.__id__ = 'earth.core.utils';

  this.timeouts = [];
  this.intervals = [];

  this.set_timeout = function(id, f, timeout, immediate, callback){
    if(this.timeouts[id]) clearTimeout(this.timeouts[id]);
    this.timeouts[id] = setTimeout(function(){
      f(id);
      if(callback) callback(id, f);
    }, timeout);
  
    if(immediate) f();
  };
  
  this.clear_timeout = function(id){
    if(this.timeouts[id]) clearTimeout(this.timeouts[id]);
  };

  this.set_interval = function(id, f, interval, immediate, callback){
    var count = 0;
    if(immediate){f(0); count++;}
    if(this.intervals[id]) clearInterval(this.intervals[id]);
    this.intervals[id] = setInterval(function(){
      f(id, count++);
      if(callback) callback(id, count++, f);
    }, interval);
  };
  
  this.clear_interval = function(id){
    if(this.intervals[id]) clearInterval(this.intervals[id]);
  };

  this.stop_propagation = function(e){
    (e.originalEvent.stopPropagation) ? e.originalEvent.stopPropagation() : e.originalEvent.cancelBubble=true ;
    (e.originalEvent.preDefault) ? e.originalEvent.preDefault() : e.originalEvent.returnValue = false;
  };

  /** 
    * extend an object with properties of one or more other objects
    */
  this.extend = function (dest) {
    var i, j, len, src;
    var complex = false;
    for (j = 1, len = arguments.length; j < len; j++) {
      src = arguments[j];
      for (i in src) {
        dest[i] = src[i];
      }
    }
    return dest;
  };
  
  /**
    * create an object from a given prototypv
    */
  this.create = (function () {
    function F() {};
    return function (prototype) {
      F.prototype = prototype;
      return new F();
    };
  })();

  this.merge_array = function(arr1, arr2){
    return $.extend(true, {}, arr2, arr1);
  };
  
  /**
    * bind a function to be called with a given context
    */
  this.bind = function (fn, obj) {
    var slice = Array.prototype.slice;

    if (fn.bind) {
      return fn.bind.apply(fn, slice.call(arguments, 1));
    }

    var args = slice.call(arguments, 2);

    return function () {
      return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
    };
  };

  // round a given number to a given precision
  this.format_number = function (num, digits) {
    var pow = Math.pow(10, digits || 5);
    return Math.round(num * pow) / pow;
  };

  // trim whitespace from both sides of a string
  this.trim = function (str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  };

  // split a string into words
  this.split_words = function (str) {
    return this.trim(str).split(/\s+/);
  };

  // set options to an object, inheriting parent's options as well
  this.set_options = function (obj, options) {
    if (!obj.hasOwnProperty('options')) {
      obj.options = obj.options ? earth.core.utils.create(obj.options) : {};
    }
    for (var i in options) {
      obj.options[i] = options[i];
    }
    return obj.options;
  };

  // make an URL with GET parameters out of a set of properties/values
  this.get_url_parameter= function (obj, existing_url, uppercase) {
    var params = [];
    for (var i in obj) {
      params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
    }
    return ((!existing_url || existing_url.indexOf('?') === -1) ? '?' : '&') + params.join('&');
  };

  this.is_array= Array.isArray || function (obj) {
    return (Object.prototype.toString.call(obj) === '[object Array]');
  };

  this.coordinate = function(coordinate){
      return parseFloat(coordinate).toFixed(6);
  };

  this.empty_image = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  
  // do nothing (used as a noop throughout the code)
  this.false_function = function () { return false; };

  this.parse_ids = function(ids, as_query_parameter){
    as_query_parameter = (as_query_parameter)?true:false;

    switch(typeof ids){
      case 'string':
        ids = ids.split('|');
        break;
      case 'number':
        ids = [ids];
        break;
      case 'undefined':
      case 'object':
        if(!(ids instanceof Array)){
          ids = [];
        }
        break;
      default:
        ids = [];
    }

    var r = [],len,id;
    for(var i = 0,len=ids.length;i<len;i++){
      id = parseInt(ids[i]);
      if(id) r.push(id);
    }

    r = this.unique(r).sort(function(a, b){return a-b});
    return (as_query_parameter)?r.join('|'):r;
  };

  this.unique = function(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
  };

  this.clone = function(obj, deep){
		if(deep){
 	    var i, ret, ret2;
  	  if (typeof obj === "object") {
  	    if (obj === null) return obj;
  	    if (Object.prototype.toString.call(obj) === "[object Array]") {
  	      ret = [];
  	      for (i = 0; i < obj.length; i++) {
  	        if (typeof obj[i] === "object") {
  	          ret2 = this.clone(obj[i], true);
  	        } else {
  	          ret2 = obj[i];
  	        }
  	        ret.push(ret2);
  	      }
  	    } else {
  	      ret = {};
  	      for (i in obj) {
  	        if (obj.hasOwnProperty(i)) {
  	          if (typeof(obj[i] === "object")) {
  	            ret2 = this.clone(obj[i], true);
  	          } else {
  	            ret2 = obj[i];
  	          }
  	          ret[i] = ret2;
  	        }
  	      }
  	    }
  	  } else {
  	    ret = obj;
    	}
  
    	return ret;
    }else{
      var target = {};
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          target[i] = obj[i];
        }
      }
      return target;
    }
  };

  this.clone_deep = function(obj) {
	};
})();

earth.extend = earth.core.utils.extend;
earth.bind = earth.core.utils.bind;
earth.stamp = earth.core.utils.stamp;
earth.set_options = earth.core.utils.set_options;

/**
  * ECMA5 SHIMs
  * 
  */

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
  String.prototype.trim= function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  };
}

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}

if (typeof Array.prototype.forEach != 'function') {
  Array.prototype.forEach = function(callback){
    for (var i = 0; i < this.length; i++){
      callback.apply(this, [this[i], i, this]);
    }
  };
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14
Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        DontEnumsLength = DontEnums.length;
  
    return function (o) {
        if (typeof o != "object" && typeof o != "function" || o === null)
            throw new TypeError("Object.keys called on a non-object");
     
        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }
     
        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }   
        }
     
        return result;
    };
})();

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}
"use strict";
/**
  * copies all static and instance methods to the object as well as options
  * 
  */
earth.core.mixin = function () {};

earth.core.mixin.extend = function (skeleton) {
  if(skeleton instanceof Function) skeleton = new skeleton(this.prototype);
  var new_object = function () {};


  // jshint camelcase: false
  var parent_proto = this.prototype;
  var proto = earth.core.utils.create(parent_proto);
  
  proto.constructor = new_object;
  new_object.prototype = proto;

  //inherit parent's statics
  for (var i in this) {
    if (this.hasOwnProperty(i) && i !== 'prototype') {
      new_object[i] = this[i];
    }
  }
  // mix static skeleton into the object
  if(skeleton.statics) {
    earth.core.utils.extend(new_object, skeleton.statics);
    delete skeleton.statics;
  }

  // merge options
  if (proto.options) {
    new_object.options = earth.core.utils.extend(earth.core.utils.create(proto.options), skeleton.options);
  }

  // mix given skeleton into the prototype
  earth.core.utils.extend(proto, skeleton);
  return new_object;
};

earth.core.mixin.add_init_hook = function (fn) { // (Function) || (String, args...)
  this.prototype.__init_hooks__ = this.prototype.__init_hooks__ || [];
  this.prototype.__init_hooks__.push(fn);
};
"use strict";

earth.core.mixin.cacheable = earth.core.mixin.extend(function(_super){
  this.__id__ = 'earth.core.mixin.cacheable';
  this.statics = {};
  this.statics.add = function(obj){
    if(obj) obj.__age = Date.now();
    return (this.cache)?this.cache.add(obj):null;
  }
  this.statics.remove = function(obj){
    return (this.cache)?this.cache.remove(obj):null;
  }
  this.statics.has = function(obj){
    return (this.cache)?this.cache.has(obj):false;
  }
  this.statics.clear = function(){
    return (this.cache)?this.cache.clear():null;
  }
  this.statics.size = function(){
    return (this.cache)?this.cache.size():null;
  }
  this.statics.all = function(){
    return (this.cache)?this.cache.all():[];
  }
  this.statics.get = function(id, age){
    var data = (this.cache)?this.cache.get(id):null; 
    if(data && data.__age && age){
        return ((data.__age - Date.now())/1000 < age)?data:null;
    }
    return data;
  };
});

earth.core.mixin.cacheable.add_init_hook(function(){
  this.constructor.add(this);
});
"use strict";

earth.core.mixin.observable = earth.core.mixin.extend(function(_super){
  this.__id__ = 'earth.core.mixin.observable';

  this.on = function (types, fn, context) {
    // types can be a map of types/handlers
    if (typeof types === 'object') {
      for (var type in types) {
        // we don't process space-separated events here for performance;
        // it's a hot path since Layer uses the on(obj) syntax
        this._on(type, types[type], fn);
      }
    } else {
      // types can be a string of space-separated words
      types = earth.core.utils.split_words(types);

      for (var i = 0, len = types.length; i < len; i++) {
        this._on(types[i], fn, context);
      }
    }

    return this;
  };

  this.off = function (types, fn, context) {
    if (!types) {
      // clear all listeners if called without arguments
      delete this._events;
    } else if (typeof types === 'object') {
      for (var type in types) {
        this._off(type, types[type], fn);
      }
    } else {
      types = earth.core.utils.split_words(types);

      for (var i = 0, len = types.length; i < len; i++) {
        this._off(types[i], fn, context);
      }
    }

    return this;
  };

  // attach listener (without syntactic sugar now)
  this._on = function (type, fn, context) {
    var events = this._events = this._events || {},
        context_id = context && context !== this && earth.stamp(context);

    if (context_id) {
      // store listeners with custom context in a separate hash (if it has an id);
      // gives a major performance boost when firing and removing events (e.g. on map object)

      var index_key = type + '_idx',
          index_len_key = type + '_len',
          type_index = events[index_key] = events[index_key] || {},
          id = earth.stamp(fn) + '_' + context_id;

      if (!type_index[id]) {
        type_index[id] = {fn: fn, ctx: context};

        // keep track of the number of keys in the index to quickly check if it's empty
        events[index_len_key] = (events[index_len_key] || 0) + 1;
      }

    } else {
      // individual layers mostly use "this" for context and don't fire listeners too often
      // so simple array makes the memory footprint better while not degrading performance

      events[type] = events[type] || [];
      events[type].push({fn: fn});
    }
  };

  this._off = function (type, fn, context) {
    var events = this._events,
        index_key = type + '_idx',
        index_len_key = type + '_len';

    if (!events) { return; }

    if (!fn) {
      // clear all listeners for a type if function isn't specified
      delete events[type];
      delete events[index_key];
      delete events[index_len_key];
      return;
    }

    var context_id = context && context !== this && earth.stamp(context),
        listeners, i, len, listener, id;

    if (context_id) {
      id = earth.stamp(fn) + '_' + context_id;
      listeners = events[index_key];

      if (listeners && listeners[id]) {
        listener = listeners[id];
        delete listeners[id];
        events[index_len_key]--;
      }

    } else {
      listeners = events[type];

      if (listeners) {
        for (i = 0, len = listeners.length; i < len; i++) {
          if (listeners[i].fn === fn) {
            listener = listeners[i];
            listeners.splice(i, 1);
            break;
          }
        }
      }
    }

    // set the removed listener to noop so that's not called if remove happens in fire
    if (listener) {
      listener.fn = earth.core.utils.false_function;
    }
  };

  this.fire = function (type, data, propagate) {

    if (!this.listens(type, propagate)) { return this; }

    var event = earth.core.utils.extend({}, data, {type: type, target: this}),
        events = this._events;

    if (events) {
        var type_index = events[type + '_idx'],
            i, len, listeners, id;

      if (events[type]) {
        // make sure adding/removing listeners inside other listeners won't cause infinite loop
        listeners = events[type].slice();

        for (i = 0, len = listeners.length; i < len; i++) {
          listeners[i].fn.call(this, event);
        }
      }

      // fire event for the context-indexed listeners as well
      for (id in type_index) {
        type_index[id].fn.call(type_index[id].ctx, event);
      }
    }

    if (propagate) {
      // propagate the event to parents (set with add_event_parent)
      this._propagate_event(event);
    }

    return this;
  };

  this.listens = function (type, propagate) {
    var events = this._events;

    if (events && (events[type] || events[type + '_len'])) { return true; }

    if (propagate) {
      // also check parents for listeners if event propagates
      for (var id in this._event_parents) {
        if (this._event_parents[id].listens(type, propagate)) { return true; }
      }
    }
    return false;
  };

  this.once = function (types, fn, context) {
    if (typeof types === 'object') {
      for (var type in types) {
        this.once(type, types[type], fn);
      }
      return this;
    }
    var handler = earth.bind(function () {
      this
          .off(types, fn, context)
          .off(types, handler, context);
    }, this);

    // add a listener that's executed once and removed after that
    return this
        .on(types, fn, context)
        .on(types, handler, context);
  };

  // adds a parent to propagate events to (when you fire with true as a 3rd argument)
  this.add_event_parent = function (obj) {
    this._event_parents = this._event_parents || {};
    this._event_parents[earth.stamp(obj)] = obj;
    return this;
  };

  this.remove_event_parent = function (obj) {
    if (this._event_parents) {
      delete this._event_parents[earth.stamp(obj)];
    }
    return this;
  };

  this._propagate_event= function (e) {
    for (var id in this._event_parents) {
      this._event_parents[id].fire(e.type, e, true);
    }
  };
});
"use strict";
earth.core.dispatcher = new earth.core.mixin.observable();
"use strict";

/**
  * class has a global cache, registering all caches in the static methods
  * also provides instance methods for a specific cache
  * on initialisation, each caching object will be added to the global cache
  * so one can get all caches initialised
  *
  */
earth.core.cache = earth.core.object.extend(new function(){
  this.__id__ = 'earth.core.cache';

  this.includes = [earth.core.mixin.observable];

  /* START STATIC METHODS */
  this.statics = {};
  /**
    * a collection of all global caches
    */
  this.statics.global = [];

  this.statics.all = function(){
    return this.global;
  };

  this.statics.add = function(id, cache){
    if(!this.has(id)){
      this.global[id] = cache;
      this.global.length++; 
    }else{
      console.error('Cache with ID ' + id + ' already exists.');
    }
  };

  this.statics.remove = function(id){
    if(this.global[id]){
      this.global[id] = null;
      delete this.global[id];
      this.global.length--; 
    }else{
      console.error('Cache with ID ' + id + ' does not exist.');
    }
  };

  this.statics.has = function(id){
    return (this.global[id] && this.global[id] != null);
  };

  this.statics.size = function(){
    return this.statics.length;
  };
  /* END STATIC METHODS */

  /**
    * the internal ID for the cache
    */
  this.id = null;

  /**
    * holds the references to the cached objects. This is to be considered a plain array.
    * @see earth.core.cache.init
    */
  this.cache = null;
  this.length = 0;

  /**
   * Converts any object to a useable index
   * if the object does not have an ID a random number will be returned and respective flags set
   * can be overridden
   */
  this.index = function(obj) {
    if (obj && !isNaN(obj-0)) return obj;
    if (obj && (typeof obj === 'string' || obj instanceof String)) return obj;
    if (obj && obj.id) return obj.id;
    if (obj && obj.__cache_id__) return obj.__cache_id__;

    //no ID, we create a random number and set the respective flag so we can identify it lateron
    (obj.__cache_id__ = Math.floor((Math.random() * (Number.MAX_VALUE/10)) + 1));
    return obj.__cache_id__;
  }

  this.has = function(obj){
    var ret = this.cache[this.index(obj)];
    return (ret)?ret:false;
  };

  this.get = function(id){
    return this.has(id);
  };

  this.add = function(obj){
    var id = this.index(obj);
    if(!this.has(obj)){
      this.fire('cache.add', {id:this.id, obj:obj});
      this.cache[id] = obj;
      this.length++; 
      return true;
    }else{
      if(id) console.error('Cache with ID ' + id + ' already exists in cache ' + this.id);
    }
    return false;
  };

  this.remove = function(obj){
    var id = this.index(obj);
    if(this.cache[id]){
      this.fire('cache.remove', {id:this.id, obj:obj});
      var obj = this.cache[id];
      this.cache[id] = null;  // XXX: MD what for?
      delete this.cache[id];
      this.length--;
      return obj;
    }
    return null;
  };

  this.clear = function(){
    this.fire('cache.clear', {id:this.id});
    this.cache = {};
    this.length = 0;
  };

  this.size = function(){
    return this.length;
  };

  this.all = function(){
    return this.cache;
  };

  this.get_id = function(){
    return this.id;
  };

  this.__init = function(id){
    this.id = id;
    this.cache = {};
    this.length = 0;
  };
});

earth.core.cache.add_init_hook(function(){
  this.constructor.add(this.id, this);
});
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {module.exports = earth;}else {if (typeof define === 'function' && define.amd) {define([], function() {return earth;});}else {window.earth = earth;}}