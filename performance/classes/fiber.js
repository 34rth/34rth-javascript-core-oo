var fiber = require('fiber');

var base = fiber.extend(function() {
	return {
    counter:0,
    instance_array:[],
    instance_string:null,
		init: function(instance_string) {
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
	}
});

var subclass_a = base.extend(function(base) {
	return {
    member_a:1,
		init: function (instance_string) {
			base.init.call(this, instance_string);
		},
		method: function () {
			base.method.call(this, false);
			this.member_a = -this.member_a;
		}
	}
});

var subclass_b = base.extend(function(base) {
	return {
    member_b:1,
		init: function (instance_string) {
			base.init.call(this, instance_string);
		},
		method: function () {
			base.method.call(this, false);
			this.member_b = -this.member_b;
		}
	}
});

module.exports = {
  name:'Fiber',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b
  }
};
