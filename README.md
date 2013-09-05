nomuon
======

This module intends to allow easy access to Node's `crypto` library via a command line tool.

The Name
--------

In the 1950s symmetry was all the rage in Physics, but a group of scientists found a startling asymmetry in the decay of the newly found muon and pion particles. Thus this module is called nomuon to both harken back to those days of the beauty of symmetry, but also remind us that symmetry is not a universal given.

Installation
------------

[npm][]
-------

```bash
$ npm install --global nomuon
```

[github][]
----------

```bash
$ git clone https://github.com/skeggse/nomuon.git
```

You'll need to figure out how to get this globally recognized this way.

Test
----

None yet, feel free to make some!

Usage
-----

The password prompt will do its best to hide your password.

```bash
# encrypt
$ nomuon --input hello.txt --output hello.aes
prompt: password:
completed output write
completed encryption
# decrypt
$ nomuon --input hello.aes --output hello.txt
prompt: password:
completed output write
completed decryption
```

TODO
----

- Add header support (hashes and metadata)
- Add signing and verifying (related to header)
- Allow piping for linux command chaining/piping
  - Allow password specified on command line?
- Actually specify a minimum Node version
- Add prettyful colors :D
- Fix incorrect password `uncaughtException` (error thrown instead of emitted)
- Add more usage!

Unlicense / Public Domain
-------------------------

> This is free and unencumbered software released into the public domain.

> Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

> In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

> For more information, please refer to <[http://unlicense.org/](http://unlicense.org/)>

[npm]: https://npmjs.org/package/nomuon "nomuon on npm"
[github]: https://github.com/skeggse/nomuon "nomuon on GitHub"
