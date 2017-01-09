var assert = require('assert');
//var earth = require('../bin/oo.js'); is required in class_parent.js

//requiring the test classes
var class_parent = require('./class_parent.js');
var class_child = require('./class_child.js');
var class_grandchild = require('./class_grandchild.js');


describe('Init Hooks', function(){
  it('Init hooks should be called', function(){
    var counter = 0;
    
    class_child.add_init_hook(function(){
      counter = 1;
    });

    var child = new class_child(1,2);
    assert.equal(1, counter);
  });

  it('Init hooks should be per called in sequence', function(){
    var counter = 0;
    
    class_child.add_init_hook(function(){
      counter = 1;
    });
    class_child.add_init_hook(function(){
      counter = 2;
    });
    class_child.add_init_hook(function(){
      counter = 3;
    });
    class_child.add_init_hook(function(){
      counter = 4;
    });
    var child = new class_child(1,2);
    assert.equal(4, counter);
  });
  
  it('Parent class init hooks should get called', function(){
    var counter = 0;

    class_parent.add_init_hook(function(){
      counter += 1; 
    });
    
    class_child.add_init_hook(function(){
      counter += 1;
    });
    var child = new class_child(1,2);
    assert.equal(2, counter);
  });
  
  it('Each instance should call the init hooks in sequence', function(){
    var counter = 0;

    class_parent.add_init_hook(function(){
      counter = this.child_number;
    });
    
    var child = new class_child(1,2);
    child = new class_child(1,5);
    assert.equal(5, counter);
  });
  
  it('Each instance should call the init hooks in sequence', function(){
    var counter = 0;

    class_child.add_init_hook(function(_super){
      counter = _super.get_parent_number.call(this);
    });
    
    var child = new class_child(3,5);
    child = new class_child(1,2);
    assert.equal(1, counter);
  });
  
  it('Init hooks are called per instance in order and time of registration. _super references the respective instance parent.', function(){
    var counter = 0;

    class_child.add_init_hook(function(_super){
      counter = _super.get_parent_number.call(this);
    });
    
    var child = new class_child(3,5);
    assert.equal(3, counter);
    
    class_child.add_init_hook(function(_super){
      counter += 1; 
    });

    child = new class_child(1,2);
    assert.equal(2, counter);//this equals 2 as new class_child(1,2) calls 2 init_hooks. The first one setting the counter as the parent number, the second one increaseing the counter by 1.
  });
});
