"use strict";
earth.core.utils = new (function(){
  this.__id__ = 'earth.core.utils';

  this.timeouts = [];
  this.intervals = [];

  this.last_id = 0;

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
  this.create = Object.create || (function () {
    function F() {}
    return function (proto) {
      F.prototype = proto;
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
  /**
    * return unique ID of an object
    */
  this.stamp = function (obj) {
    // jshint camelcase: false
    obj._earth_id = obj._earth_id || ++earth.core.utils.last_id;
    return obj._earth_id;
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

  this.clone = function(obj){
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        target[i] = obj[i];
      }
    }
    return target;
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
