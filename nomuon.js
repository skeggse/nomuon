var filed = require('filed');
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

  // TODO: catch cryptoStream errors (usually caused by incorrect password)

  var ioerror = function(type) {
    return function(err) {
      if (err) {
        if (err.code === 'ENOENT') {
          console.error('could not locate', type, 'file', result[type]);
          process.exit(1);
        }
        console.error(err.message);
        process.exit(-1);
      }
    };
  };

  var input = filed(result.input);
  var output = filed(result.output);
  input.on('error', ioerror('input'));
  output.on('error', ioerror('output'));

  input.pipe(cryptoStream).pipe(output);

  input.on('end', function() {
    console.log('completed input read');
  });

  cryptoStream.on('end', function() {
    console.log('completed', decrypt ? 'decryption' : 'encryption');
  });

  output.on('end', function() {
    console.log('completed output write');
  });
});
