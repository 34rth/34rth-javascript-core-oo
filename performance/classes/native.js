// classical John Resig's extend
function __extend(Child, Parent) {
	var F = function() {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}


var base= function(instance_string) {
	this.instance_string = instance_string;
};

base.prototype.counter = 0;
base.prototype.instance_array = [];
base.prototype.instance_string = null;

base.prototype.method = function (prevent_inline) {
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

var subclass_a = function(instance_string) {
	this.member_a = 1;
	base.call(this, instance_string);
};
__extend(subclass_a, base);
subclass_a.prototype.method = function() {
	this.member_a = -this.member_a;
	base.prototype.method.call(this, false);
};

var subclass_b = function(instance_string) {
	this.member_b = 1;
	base.call(this, instance_string);
};
__extend(subclass_b, base);
subclass_b.prototype.method = function() {
	this.member_b = -this.member_b;
	base.prototype.method.call(this, false);
};

module.exports = {
  name:'native',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b
  }
};
