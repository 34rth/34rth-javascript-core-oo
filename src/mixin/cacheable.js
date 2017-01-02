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
