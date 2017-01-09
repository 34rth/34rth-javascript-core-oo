var Benchmark = require('benchmark');
var cla = require('command-line-args');
var options = cla([
  {name:'benchmark', alias:'b', type:String, defaultValue:'all'},
  {name:'classes', alias:'c', type:String, defaultValue:'all'}
]);

options.benchmark = options.benchmark.split(',').map(v => v.toLowerCase());
options.classes = options.classes.split(',').map(v => v.toLowerCase());

var suite_instantiation = new Benchmark.Suite('INSTANTIATION');
var suite_public_method = new Benchmark.Suite('PUBLIC METHOD INVOCATION');
var suite_static_method = new Benchmark.Suite('STATIC METHOD INVOCATION');
var name, base, subclass_a, subclass_b;

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

for(c in classes){
  name = classes[c].name;
  if(options.classes.indexOf('all')!=-1||options.classes.indexOf(name.toLowerCase())!=-1){
    //console.log(classes[c].classes.subclass_a);
    base = classes[c].classes.base;
    subclass_a = classes[c].classes.subclass_a;
    subclass_b = classes[c].classes.subclass_b;
    var instance_a = new subclass_a('a');
    var instance_b = new subclass_a('b');
  
    suite_instantiation.add(name, function(a,b){
      return function(){
        new a('a');
        new b('b');
      };
    }(subclass_a, subclass_b), {
      setup:function(){},
      teardown:function(){if (global.gc)global.gc();}
    });
  
    suite_public_method.add(name, function(a,b){
      return function(){
        a.method();
        b.method();
      };
    }(new subclass_a('a'), new subclass_b('b')), {
      setup:function(){},
      teardown:function(){if (global.gc)global.gc();}
    });
   
    suite_static_method.add(name, function(a,b){
        return function(){
  	      a.get_static_property();
    	    b.get_static_property();
        };
      }(subclass_a, subclass_b), {
        setup:function(){},
        teardown:function(){if (global.gc)global.gc();}
      });
  }
}

var suites = [suite_instantiation, suite_public_method, suite_static_method];
var benchmarks = {
  instantiation:[],
  public_method:[],
  static_method:[]
}

function run_benchmarks(suite, benchmarks){
  for(var i = 0; i< suite.length;i++){
    suite[i].on('complete', function(){
      add_benchmark(benchmarks, this);
      if(benchmarks.length == suite.length){
        report_benchmarks(suite, benchmarks);
      }
    }).run({async:true});
  }
}

function add_benchmark(benchmarks, benchmark){
  benchmarks.push(benchmark);
}

function report_benchmarks(suite, benchmarks){
  var benchmark = null, name, error, hz, statistics, size, pm;
  benchmarks.sort(function(a,b) {return (b.hz > a.hz) ? 1 : ((a.hz> b.hz) ? -1 : 0);} );
  console.log(suite.name); 
  console.log('| # | Library | ops/sec | Relative MoE | Min ops/sec | Max ops/sec | Sample Size |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');
  for(var i = 0; i< benchmarks.length;i++){
    benchmark = benchmarks[i],
    name = benchmark.name,
    error = benchmark.error,
    hz = benchmark.hz,
    statistics = benchmark.stats,
    size = statistics.sample.length,
    pm = '\xb1';
    
    console.log(
      '| ' + (i+1)
      + '| ' + name 
      + ' | ' + ((error)?'n\\a':Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0)))
      + ' | ' + ((error)?'n\\a':statistics.rme.toFixed(2))
      + ' | ' + ((error)?'n\\a':Benchmark.formatNumber((hz - hz*statistics.rme/100).toFixed(hz < 100 ? 2 : 0)))
      + ' | ' + ((error)?'n\\a':Benchmark.formatNumber((hz + hz*statistics.rme/100).toFixed(hz < 100 ? 2 : 0)))
      + ' | ' + ((error)?'n\\a':size)
      + ' |');
  }
}

if(options.benchmark.indexOf('all')!=-1||options.benchmark.indexOf('instantiation')!=-1) run_benchmarks(suite_instantiation, benchmarks.instantiation);
if(options.benchmark.indexOf('all')!=-1||options.benchmark.indexOf('public')!=-1) run_benchmarks(suite_public_method, benchmarks.public_method);
if(options.benchmark.indexOf('all')!=-1||options.benchmark.indexOf('static')!=-1) run_benchmarks(suite_static_method, benchmarks.static_method);


/*
 * leads to deterministic garbage collector errors in the performance statistics
 * -> submit issue on benchmarkjs
for(var suite in suites){
  suites[suite].on('complete', function() { 
    var benchmarks = [], benchmark = null, name, error, hz, statistics, size, pm;
    
    for(var i = 0; i<this.length;i++){
      benchmarks.push(this[i]);
    }
    
    benchmarks.sort(function(a,b) {return (b.hz > a.hz) ? 1 : ((a.hz> b.hz) ? -1 : 0);} );
    console.log(this.name); 
    console.log('| # | Library | ops/sec | Relative MoE | Min ops/sec | Max ops/sec | Sample Size |');
    console.log('| --- | --- | --- | --- | --- | --- | --- |');
    for(var i = 0; i< benchmarks.length;i++){
      benchmark = benchmarks[i],
      name = benchmark.name,
      error = benchmark.error,
      hz = benchmark.hz,
      statistics = benchmark.stats,
      size = statistics.sample.length,
      pm = '\xb1';
      
      console.log(
        '| ' + (i+1)
        + '| ' + name 
        + ' | ' + ((error)?'n\\a':Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0)))
        + ' | ' + ((error)?'n\\a':statistics.rme.toFixed(2))
        + ' | ' + ((error)?'n\\a':Benchmark.formatNumber((hz - hz*statistics.rme/100).toFixed(hz < 100 ? 2 : 0)))
        + ' | ' + ((error)?'n\\a':Benchmark.formatNumber((hz + hz*statistics.rme/100).toFixed(hz < 100 ? 2 : 0)))
        + ' | ' + ((error)?'n\\a':size)
        + ' |');
    }
  }).run({
    'async': true
  });
}
*/
