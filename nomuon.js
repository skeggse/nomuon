#!/usr/bin/env node
var fs = require('fs');
var crypto = require('crypto');
var prompt = require('prompt');
var optimist = require('optimist');
var Progress = require('progress');

// TODO: add headers with hashes, metadata
// TODO: add signing and verifying

var ALPHA = /[^a-z0-9]+/ig;

var cipherList = crypto.getCiphers();
var ciphers = (function(cipherList) {
  var ciphers = {};
  for (var i = 0; i < cipherList.length; i++) {
    var name = cipherList[i].replace(ALPHA, '').toLowerCase();
    ciphers[name] = cipherList[i];
  }
  return ciphers;
}(cipherList));

prompt.override = optimist
  .usage('Encrypt or decrypt a file.\nUsage: $0')
  .options('h', {
    alias: 'help',
    describe: 'Display this message',
    boolean: true
  })
  .options('c', {
    alias: 'cipher',
    describe: 'Specify a cipher',
    default: 'aes-256-cbc'
  })
  .options('i', {
    alias: 'input',
    describe: 'Specify an input file'
  })
  .options('o', {
    alias: 'output',
    describe: 'Specify an output file'
  })
  .options('d', {
    alias: 'decrypt',
    describe: 'Decrypt the file',
    boolean: true
  })
  .options('md5', {
    describe: 'Print the md5 hash of the file',
    boolean: true,
    default: true
  })
  .argv;

if (prompt.override.help) {
  optimist.showHelp();
  process.exit(0);
}

prompt.start();

prompt.get(['cipher', {
  name: 'input',
  required: true
}, {
  name: 'output',
  required: true
}, {
  name: 'password',
  hidden: true,
  required: true
}], function(err, result) {
  if (err) {
    if (err.message === 'canceled') {
      process.stdout.write('\n');
      process.exit(2);
    }
    console.error(err.message);
    process.exit(-1);
  }
  var cipherType = ciphers[result.cipher.replace(ALPHA, '').toLowerCase()];
  if (!cipherType) {
    console.error('unrecognized cipher:', result.cipher);
    console.log('recommended (and default) cipher: aes-256-cbc');
    console.log('supported ciphers:', cipherList.join(', '));
    process.exit(1);
  }
  var decrypt = prompt.override.decrypt;
  var constructor = crypto[decrypt ? 'createDecipher' : 'createCipher'];
  var cryptoStream = constructor.call(crypto, cipherType, result.password);

  var hash = prompt.override.md5 && crypto.createHash('md5');

  // TODO: catch cryptoStream errors (usually caused by incorrect password)

  fs.stat(result.input, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('could not locate input file', result.input);
        process.exit(1);
      }
      console.error(err.message);
      process.exit(-1);
    }
    var input = fs.createReadStream(result.input);
    var output = fs.createWriteStream(result.output);

    input.pipe(cryptoStream).pipe(output);

    // where should we listen for data?
    var bar = new Progress('  [:bar] :percent :etas', {
      total: stats.size,
      width: 64,
      complete: '=',
      incomplete: ' '
    });

    // do some funky stuff to work around high number of unnecessary events
    var rolling = 0, total = 0, last = -1;
    input.on('data', function(data) {
      total += data.length;
      rolling += data.length;
      var percent = (100 * total / stats.size) | 0;
      if (last !== percent) {
        bar.tick(rolling);
        rolling = 0;
      }
      last = percent;
    });

    if (hash) {
      var hashSource = decrypt ? cryptoStream : input;
      hashSource.on('data', hash.update.bind(hash));
      hashSource.once('end', function() {
        console.log('md5 hash', hash.digest('hex'));
      });
    }

    input.on('close', function() {
      console.log('completed input read');
    });

    cryptoStream.on('end', function() {
      console.log('completed', decrypt ? 'decryption' : 'encryption');
    });

    output.on('finish', function() {
      console.log('completed output write');
    });
  });
});
