var Class = require('class.extend');

var base = Class.extend({
	counter:0,
  instance_array:[],
	instance_string:null,
	init: function(instance_string){
		this.instance_string = instance_string;
	},
	method: function (prevent_inline) {
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

var subclass_a = base.extend({
	member_a:1,
	init: function(instance_string){
		this._super(instance_string);
	},
	method: function(){
		this.member_a = -this.member_a;
		return this._super(false);
	}
});

var subclass_b = base.extend({
	member_b:1,
	init: function(instance_string){
		this._super(instance_string);
	},
	method: function(){
		this.member_b = -this.member_b;
		return this._super(false);
	}
});

module.exports = {
  name:'John Resig\'s Class',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b
  }
};
