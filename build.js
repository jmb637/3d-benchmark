'use strict';

const browserify = require('browserify');
const fs = require('fs');

const b = browserify();
b.add('./scripts/controller.js');
const destination = fs.createWriteStream('./benchmark.js');
b.bundle().pipe(destination);
