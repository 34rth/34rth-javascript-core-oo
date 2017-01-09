var assert = require('assert');
var class_parent = require('./class_parent.js');

var mixin_class_parent = require('./mixin_class_parent.js');
var mixin_class_child = require('./mixin_class_child.js');

describe('Mixin', function(){
  it('Mixed class should include the functions of the mixin object - testing with child class', function(){
    var m1 = new mixin_class_child(10,15);
    var m2 = new mixin_class_child(20,25);

    assert.equal(10 , m1.mixin_variable); 
    assert.equal(10, m1.get_parent_class_value()); 
    assert.equal(15, m1.get_child_class_value()); 
    assert.equal(10 , m2.mixin_variable); 

    assert.equal(20, m2.get_parent_class_value()); 
    assert.equal(25, m2.get_child_class_value()); 
    
    m1.mixin_variable = 9;
    
    assert.equal(9, m1.mixin_variable); 
    assert.equal(10 , m2.mixin_variable); 
  });

  it('Mixed class should include the functions of the mixin object - testing with parent class', function(){
    var m = new mixin_class_parent(45);
    assert.equal(10 , m.mixin_variable); 
    assert.equal(45, m.get_parent_class_value()); 
    assert.equal(undefined, m.increase_number()); //the number variable does not exist in parentclass. incrementing should return undefined
  });

  it('Mixed class instances should not share complex object instances', function(){
    var m1 = new mixin_class_child(10,15);
    var m2 = new mixin_class_child(20,25);

    assert.equal(m1.mixin_object.first, m2.mixin_object.first);
    assert.equal(m1.mixin_object.second, m2.mixin_object.second);

    m1.mixin_object.third = 4;
    assert.notEqual(m1.mixin_object.third, m2.mixin_object.third);
    m2.mixin_object.second = 'second here';
    assert.notEqual(m1.mixin_object.second, m2.mixin_object.second);
  });
  

  it('Static methods shadowed by mixins should be ignored and should return the same value as in original class', function(){
    assert.equal(mixin_class_parent.parent_static_function(), class_parent.parent_static_function());
  });
  
  it('New static methods should be added by mixin', function(){
    assert.equal('mixin static', mixin_class_parent.mixin_static_function());
    assert.equal('mixin static', mixin_class_child.mixin_static_function());
  });
});

describe('Mixin-Inheritance', function(){
  it('Child and parent member variables should not be shared', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);
      var p = new mixin_class_parent(i, i+1);
      assert.equal(c.complex_object.first, p.complex_object.first);

      c.complex_object.first = 'foo';

      assert.notEqual(c.complex_object.first, p.complex_object.first);
    }
  });

 it('Should call the parent method from the child instance, returning the parent instance variable', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);
      assert.equal(i, c.get_parent_number());
    }
  });

  it('Should call the child method from the child instance', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);
      assert.equal(i+1, c.get_child_number());
    }
  });
  
  it('Should enable direct access to variable in child', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);
      assert.equal(i+1, c.get_child_number());
      c.child_number = i*2;
      assert.equal(i*2, c.get_child_number());
    }
  });
  
  it('Should allow access to public variable', function(){
    var c = new mixin_class_child(1,2);
    assert.equal('should be seen and accessible from the outside', c.public_variable);
  });
  
  it('Should not allow access to private variable', function(){
    var c = new mixin_class_child(1,2);
    assert.equal(undefined, c.private_variable);
    for(var i in c){
      assert.notEqual('private_variable', i);
    }
    
    for(var i in mixin_class_child){
      assert.notEqual('private_variable', i);
    }
  });
  
  
  it('Two child instances should not be influenced when changing trivial and complex values.', function(){
    for(var i = 0;i<10;i++){
      var c1 = new mixin_class_child(i, i+1);
      var c2 = new mixin_class_child(i*2, i*3);
      assert.equal(c1.complex_object.first, c2.complex_object.first);
      assert.equal(c1.complex_object.second, c2.complex_object.second);
      c1.complex_object.first = 1;
      c2.complex_object.first = 2;
      assert.notEqual(c1.complex_object, c2.complex_object);
      assert.equal(c1.complex_object.second, c2.complex_object.second);
    }
  });
  
  it('Parent instances should not be influenced when changing trivial and complex values.', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);
      var p = new mixin_class_parent(i*2);

      p.complex_object.first = 'foo';
      c.complex_object.first = 'bar';

      assert.equal('foo', p.complex_object.first);
      assert.equal('bar', c.complex_object.first);
    }
  });
  
  it('Should return values for the shadowing function', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);//new child instance with parent number 1
      assert.equal('child', c.shadowable_function());
    }
  });

  it('Should return values for the shadowed function', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);//new child instance with parent number 1
      assert.equal('parent', mixin_class_parent.prototype.shadowable_function.call(c));
    }
  });
  
  it('Calling the shadowed function from within the shadowing function', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);//new child instance with parent number 1
      assert.equal('parentchild', c.shadowable_function(true));
    }
  });
   
  it('Shadowing function call from within the child setting variables in the parent, should set them in the context of the child instance', function(){
    for(var i = 0;i<10;i++){
      var c = new mixin_class_child(i, i+1);
      c.set_complex_object_value_child('first', i*6);
      assert.equal(i*6, c.complex_object.first);
      
      c.set_complex_object_value('first', i*9);
      assert.equal(i*9, c.complex_object.first);
      
      c.set_complex_object_value_child('third', i*6*4);
      assert.equal(i*6*4, c.complex_object.third);
      
      c.set_complex_object_value('fourth', i*6*8);
      assert.equal(i*6*8, c.complex_object.fourth);
    }
  });
  

  it('Should give access to static function of child', function(){
    assert.equal('child static', mixin_class_child.child_static_function());
  });
  
  it('Should give access to static function of parent', function(){
    assert.equal('parent static', mixin_class_parent.parent_static_function());
  });
  
  it('Static function should bubble up the chain', function(){
    assert.equal('parent static', mixin_class_child.parent_static_function());
  });
});
