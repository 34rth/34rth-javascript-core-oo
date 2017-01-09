//compile: ./node_modules/typescript/bin/tsc --outfile ./bin/performance/typescript.js ./bin/performance/typescript.ts
declare var dummy;
declare var module;

class base {
    counter: number = 0;
    instance_array: String[] = [];
    instance_string: string;
    static static_property: string = 'static';
    constructor (instance_string: string) {
    		var cachebuster_typescript_base_constructor;
        this.instance_string = instance_string;
    }
    method(prevent_inline) {
    		var cachebuster_typescript_base_method;
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
		static get_static_property(){
      var cachebuster_typescript_base_static_method;
			return base.static_property;
		}
}

class subclass_a extends base {
    member_a: number = 1;
    constructor (instance_string: string) {
        super(instance_string);
    		var cachebuster_typescript_subclass_a_constructor;
    }
    method() {
    		var cachebuster_typescript_subclass_a_method;
        this.member_a = -this.member_a;
        super.method(false);
    }
		static get_static_property(){
    		var cachebuster_typescript_subclass_a_static_method;
			return base.static_property + 'A';
		}
}

class subclass_b extends base {
    member_b: number = -1;
    constructor (instance_string: string) {
        super(instance_string);
    		var cachebuster_typescript_subclass_b_constructor;
    }
    method() {
    		var cachebuster_typescript_subclass_method;
        this.member_b = -this.member_b;
        super.method(false);
    }
		static get_static_property(){
    	var cachebuster_typescript_subclass_b_static_method;
			return base.static_property + 'B';
		}
}

module.exports = {
  name:'Typescript',
  classes:{
    base:base,
    subclass_a:subclass_a,
    subclass_b:subclass_b
  }
};
