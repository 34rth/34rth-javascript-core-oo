var cla = require('command-line-args');
var timer = require('./timer.js');
timer = new timer();

Number.prototype.format = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

var options = cla([
  {name:'benchmark', alias:'b', type:String, defaultValue:'all'},
  {name:'classes', alias:'c', type:String, defaultValue:'all'}
]);
var benchmarks = {
  instantiation:[],
  instantiation_2:[],
  public_method:[],
  public_method_2:[],
  static_method:[]
}

options.benchmark = options.benchmark.split(',').map(v => v.toLowerCase());
options.classes = options.classes.split(',').map(v => v.toLowerCase());

var classes = [];
classes.push(require('./classes/34rth.js'));
classes.push(require('./classes/jsface.js'));
classes.push(require('./classes/native.js'));
classes.push(require('./classes/typescript.js'));
classes.push(require('./classes/john_resig.js'));
classes.push(require('./classes/inherit.js'));
classes.push(require('./classes/fiber.js'));
classes.push(require('./classes/lava_classmanager_polymorphic.js'));
classes.push(require('./classes/lava_classmanager_monomorphic.js'));
classes.push(require('./classes/augment.js'));

var samples = 10*1000*1000;
var name, base, subclass_a, subclass_b, subsubclass_a, subsubclass_b, instance_a, instance_b, subinstance_a, subinstance_b, tmp_a, tmp_b;
for(c in classes){
  name = classes[c].name;
  if(options.classes.indexOf('all')!=-1||options.classes.indexOf(name.toLowerCase())!=-1){
    //console.log(classes[c].classes.subclass_a);
    console.log(name);
    base = classes[c].classes.base;
    subclass_a = classes[c].classes.subclass_a;
    subclass_b = classes[c].classes.subclass_b;
    subsubclass_a = classes[c].classes.subsubclass_a;
    subsubclass_b = classes[c].classes.subsubclass_b;
    instance_a = new subclass_a('a');
    instance_b = new subclass_a('b');
    subinstance_a = new subsubclass_a('a');
    subinstance_b = new subsubclass_a('b');
    
    timer.start(); 
    for(var i = 0;i<samples;i++){
      tmp_a = new subclass_a('a');
      tmp_b = new subclass_b('b');
    }
    benchmarks.instantiation.push({name:name, time:timer.stop()});
    
    timer.start(); 
    for(var i = 0;i<samples;i++){
      tmp_a = new subsubclass_a('a');
      tmp_b = new subsubclass_b('b');
    }
    benchmarks.instantiation_2.push({name:name, time:timer.stop()});
  
    timer.start(); 
    for(var i = 0;i<samples;i++){
      tmp_a = (new subclass_a(i)).method();
      tmp_b = (new subclass_b(i)).method();
    }
    benchmarks.public_method.push({name:name, time:timer.stop()});
  
    timer.start(); 
    for(var i = 0;i<samples;i++){
      tmp_a = (new subsubclass_a(i)).method();
      tmp_b = (new subsubclass_b(i)).method();
    }
    benchmarks.public_method_2.push({name:name, time:timer.stop()});
    
    

    try{
     timer.start(); 
      for(var i = 0;i<samples;i++){
      	  tmp_a = subclass_a.get_static_property();
          tmp_b = subclass_b.get_static_property();
      }
      benchmarks.static_method.push({name:name, time:timer.stop()});
    }catch(e){
      timer.stop();
    }
  }
}

for(var i in benchmarks){
  console.log(i);
  
  benchmarks[i].sort(function(a,b) {return (a.time > b.time) ? 1 : ((b.time> a.time) ? -1 : 0);} );
  console.log('| # | Library | ops/ms | total time (in ms) | Sample Size |');
  console.log('| --- | --- | --- | --- | --- |');
  for(var j = 0; j< benchmarks[i].length;j++){
    benchmark = benchmarks[i][j],
    name = benchmark.name,
    time = benchmark.time,
    ops = samples/time;
    
    console.log(
      '| ' + (j+1)
      + ' | ' + name 
      + ' | ' + ops.format(0)
      + ' | ' + time.format(2)
      + ' | ' + samples.format()
      + ' |');
  }
}
