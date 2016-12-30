/**
 * Helper file to producte the package content concatenating the src files
 */

var fs = require('fs');
var async = require('async');

function concat(files, destination, cb) {
  async.waterfall([
    async.apply(read, files),
    async.apply(write, destination)
  ], cb);
}

function write(destination, buffers, cb) {
    fs.writeFile(
      destination,
      Buffer.concat(buffers),
      cb
    );
}

function read(files, cb) {
  async.mapSeries(
      files,
      readFile,
      cb
  );

  function readFile(file, cb) {
    fs.readFile(file, cb)
  }
}

var input_files = [
  './src/object.js',
  './src/utils.js',
  './src/mixin.js',
  './src/mixin/cacheable.js',
  './src/mixin/observable.js',
  './src/dispatcher.js',
  './src/cache.js'
];

var output_file = './bin/oo.js'; 

(new Promise(function(resolve, reject){
  //first we concatenate the source files
  concat(input_files, output_file, function(e){
    if(!e){
      resolve(output_file);
    }else{
      reject({e:e, message:'Error concatenating ' + input_files.join(', ')});
    }
  });
})).then(function(file){
  //if all goes right, we append the export
  fs.appendFileSync(file, 'module.exports = earth;');
  return file;
}, function(reason){
  console.log(reason.message);
  console.log(reason.e);
}).then(function(file){
  console.log('successfully created plugin file ' + file);
});
