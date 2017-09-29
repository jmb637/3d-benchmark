'use strict';

/**
 * Tests for the matrix module.
 */

const matrix = require('../scripts/gpu/matrix.js');

function runTests() {
  testCreateIdentityMat4();
  testSetIdentityMat4();
  testMultiplyMat4ByMat4();

  console.log('All matrix tests passed.');
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`${String(actual)} !== ${String(expected)}`);
  }
}

function testCreateIdentityMat4() {
  const result = matrix.createIdentityMat4();
  assertEqual(result.length, 16);

  for (let i = 0; i < result.length; ++i) {
    if (i % 5 === 0) {
      assertEqual(result[i], 1);
    } else {
      assertEqual(result[i], 0);
    }
  }
}

function testSetIdentityMat4() {
  const mat4 = matrix.createIdentityMat4();
  for (let i = 0; i < mat4.length; ++i) {
    mat4[i] = -1;
  }

  matrix.setIdentityMat4(mat4);
  for (let i = 0; i < mat4.length; ++i) {
    if (i % 5 === 0) {
      assertEqual(mat4[i], 1);
    } else {
      assertEqual(mat4[i], 0);
    }
  }
}

function testMultiplyMat4ByMat4() {
  const m1 = matrix.createIdentityMat4();
  const m2 = matrix.createIdentityMat4();
  m2[0] = 20;
  m2[1] = 4;
  m2[2] = -3;
  m2[3] = -10;
  m2[4] = 16;
  m2[5] = -52;
  m2[6] = 31;
  m2[10] = 2;
  m2[11] = 1;
  m2[12] = 2;
  m2[12] = -3;
  m2[14] = 20;

  const result = matrix.createIdentityMat4();
  matrix.multiplyMat4ByMat4(m1, m2, result);
  assertEqual(result.length, 16);
  for (let i = 0; i < result.length; ++i) {
    assertEqual(result[i], m2[i]);
  }
}

runTests();
