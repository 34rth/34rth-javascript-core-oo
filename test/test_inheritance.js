var assert = require('assert');
//var earth = require('../bin/oo.js'); is required in class_parent.js

//requiring the test classes
var class_parent = require('./class_parent.js');
var class_child = require('./class_child.js');
var class_grandchild = require('./class_grandchild.js');

describe('Inheritance', function(){
  it('Child and parent member variables should not be shared', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);
      var p = new class_parent(i, i+1);
      assert.equal(c.complex_object.first, p.complex_object.first);

      c.complex_object.first = 'foo';

      assert.notEqual(c.complex_object.first, p.complex_object.first);
    }
 });
 
  it('Make sure complex object function is copied correctly.', function(){
    var c = new class_parent(20);
    assert.equal(10, c.complex_object.my_complex_object_function());
  });

 it('Should call the parent method from the child instance, returning the parent instance variable', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);
      assert.equal(i, c.get_parent_number());
    }
 });

  it('Should call the child method from the child instance', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);
      assert.equal(i+1, c.get_child_number());
    }
  });
  
  it('Should enable direct access to variable in child', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);
      assert.equal(i+1, c.get_child_number());
      c.child_number = i*2;
      assert.equal(i*2, c.get_child_number());
    }
  });
  
  it('Should allow access to public variable', function(){
    var c = new class_child(1,2);
    assert.equal('should be seen and accessible from the outside', c.public_variable);
  });
  
  it('Should not allow access to private variable', function(){
    var c = new class_child(1,2);
    assert.equal(undefined, c.private_variable);
    for(var i in c){
      assert.notEqual('private_variable', i);
    }
    
    for(var i in class_child){
      assert.notEqual('private_variable', i);
    }
  });
  
  
  it('Two child instances should not be influenced when changing trivial and complex values.', function(){
    for(var i = 0;i<10;i++){

      var c1 = new class_child(i, i+1);
      var c2 = new class_child(i*2, i*3);

      assert.equal(c1.complex_object.first, c2.complex_object.first);
      assert.equal(c1.complex_object.second, c2.complex_object.second);
      c1.complex_object.first = 1;
      c2.complex_object.first = 2;
      assert.notEqual(c1.complex_object, c2.complex_object);
      assert.equal(c1.complex_object.second, c2.complex_object.second);
    }
  });
  
  it('Two child instances should equal each other when from same instance, but not equal when different instances.', function(){
    for(var i = 0;i<10;i++){

      var p = new class_parent(i*2);
      var c1 = new class_child(i, i+1);
      var c2 = new class_child(i*2, i*3);

      assert.equal(true, c1.equals(c1));
      assert.equal(false, c1.equals(c2));
      assert.equal(false, c1.equals(p));
      assert.equal(false, c2.equals(p));
      assert.equal(false, c2.equals(class_child));
      assert.equal(false, c1.equals(class_child));
    }
  });
  
  it('Parent instances should not be influenced when changing trivial and complex values.', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);
      var p = new class_parent(i*2);

      p.complex_object.first = 'foo';
      c.complex_object.first = 'bar';

      assert.equal('foo', p.complex_object.first);
      assert.equal('bar', c.complex_object.first);
    }
  });

 
  it('Parent instances should not be influenced when changing trivial and complex values over inheritance depth > 1.', function(){
    for(var i = 0;i<10;i++){
      var g = new class_grandchild(i/2, i/2+1, i/2+8);
      var c = new class_child(i, i+1);
      var p = new class_parent(i*2);

      p.complex_object.first = 'foo';
      c.complex_object.first = 'bar';
      g.complex_object.first = 'zoo';

      assert.equal('foo', p.complex_object.first);
      assert.equal('bar', c.complex_object.first);
      assert.equal('zoo', g.complex_object.first);

      g.complex_object.third = 'foo';

      assert.equal(undefined, p.complex_object.third);
      assert.equal(undefined, c.complex_object.third);
      assert.equal('foo', g.complex_object.third);
    }
  });
  
  it('Should return values for the shadowing function', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);//new child instance with parent number 1
      assert.equal('child', c.shadowable_function());
    }
  });

  it('Should return values for the shadowed function', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);//new child instance with parent number 1
      assert.equal('parent', class_parent.prototype.shadowable_function.call(c));
    }
  });
  
  it('Calling the shadowed function from within the shadowing function', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);//new child instance with parent number 1
      assert.equal('parentchild', c.shadowable_function(true));
    }
  });
   
  it('Shadowing function call from within the child setting variables in the parent, should set them in the context of the child instance', function(){
    for(var i = 0;i<10;i++){
      var c = new class_child(i, i+1);
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
  
  it('Inheritance depth', function(){
    for(var i = 0;i<10;i++){
      var g = new class_grandchild(i/2, i/2+1, i/4 + 8);
      var c = new class_child(i/3, i/4+1);
      assert.equal(i/3, c.get_parent_number());
      assert.equal(i/4+1, c.get_child_number());
      assert.equal(i/2, g.get_parent_number());
      assert.equal(i/2+1, g.get_child_number());
      assert.equal(i/4 + 8, g.get_grandchild_number());
    }
  });

  it('Should give access to static function of child', function(){
    assert.equal('child static', class_child.child_static_function());
  });
  
  it('Should give access to static function of parent', function(){
    assert.equal('parent static', class_parent.parent_static_function());
  });
  
  it('Static function should bubble up the chain', function(){
    assert.equal('parent static', class_child.parent_static_function());
  });
});
