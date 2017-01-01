var class_34rth = earth.core.object.extend(new function() {
    this.__init = function(instance_string) {
          this.counter = 0;
          this.instance_array = [];
          this.instance_string = instance_string;
        };

    this.method = function(prevent_inline) {
          if (this.counter > THRESHOLD) this.counter = this.counter / 2;
          else this.counter++;
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
});

var subclassA_34rth = class_34rth.extend(new function() {
    this.__init = function(instance_string) {
          class_34rth.prototype.__init.call(this, instance_string);
          this.member_a = 1;
        };
    this.method = function(prevent_inline) {
          this.member_a = -this.member_a;
          class_34rth.prototype.method.call(this, false);
        };
});

var subclassB_34rth = class_34rth.extend(new function() {
    this.__init = function(instance_string) {
          class_34rth.prototype.__init.call(this, instance_string);
          this.member_B = 1;
        };
    this.method = function(prevent_inline) {
          this.member_b = -this.member_b;
          class_34rth.prototype.method.call(this, false);
        };
});
