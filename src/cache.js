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
