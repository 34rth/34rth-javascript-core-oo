var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base = (function () {
    function base(instance_string) {
        this.counter = 0;
        this.instance_array = [];
        this.instance_string = instance_string;
    }
    base.prototype.method = function (prevent_inline) {
        if (this.counter > 99)
            this.counter = this.counter / 2;
        else
            this.counter++;
        if (prevent_inline) {
            var i = 0;
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
            for (i = 0; i < 1; i++)
                dummy.method();
        }
    };
    base.get_static_property = function () {
        return base.static_property;
    };
    return base;
}());
base.static_property = 'static';
var subclass_a = (function (_super) {
    __extends(subclass_a, _super);
    function subclass_a(instance_string) {
        var _this = _super.call(this, instance_string) || this;
        _this.member_a = 1;
        return _this;
    }
    subclass_a.prototype.method = function () {
        this.member_a = -this.member_a;
        _super.prototype.method.call(this, false);
    };
    subclass_a.get_static_property = function () {
        return base.static_property + 'A';
    };
    return subclass_a;
}(base));
var subclass_b = (function (_super) {
    __extends(subclass_b, _super);
    function subclass_b(instance_string) {
        var _this = _super.call(this, instance_string) || this;
        _this.member_b = -1;
        return _this;
    }
    subclass_b.prototype.method = function () {
        this.member_b = -this.member_b;
        _super.prototype.method.call(this, false);
    };
    subclass_b.get_static_property = function () {
        return base.static_property + 'B';
    };
    return subclass_b;
}(base));
var subsubclass_a = (function (_super) {
    __extends(subsubclass_a, _super);
    function subsubclass_a(instance_string) {
        return _super.call(this, instance_string) || this;
    }
    return subsubclass_a;
}(subclass_a));
var subsubclass_b = (function (_super) {
    __extends(subsubclass_b, _super);
    function subsubclass_b(instance_string) {
        return _super.call(this, instance_string) || this;
    }
    return subsubclass_b;
}(subclass_b));
module.exports = {
    name: 'Typescript',
    classes: {
        base: base,
        subclass_a: subclass_a,
        subclass_b: subclass_b,
        subsubclass_a: subsubclass_a,
        subsubclass_b: subsubclass_b
    }
};
