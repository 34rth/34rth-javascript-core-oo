var earth = require('../bin/oo.js');
var timer = earth.core.object.extend(function(_super){
    this.__id__ = 'timer';
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
}, false);

module.exports = timer;
