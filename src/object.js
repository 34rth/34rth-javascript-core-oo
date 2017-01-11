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
