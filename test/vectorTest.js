'use strict';

/**
 * Tests for the vector module.
 */

const vector = require('../scripts/cpu/vector.js');

function runTests() {
  testAdd();
  testSubtract();
  testDotProduct();
  testCrossProduct();

  console.log('All vector tests passed.');
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`${String(actual)} !== ${String(expected)}`);
  }
}

function testAdd() {
  const v1 = [2, 0, -1];
  const v2 = [5, -11, -3];

  const result = vector.add(v1, 0, v2, 0);
  assertEqual(result[0], 7);
  assertEqual(result[1], -11);
  assertEqual(result[2], -4);
}

function testSubtract() {
  const v1 = [4, -3, 2];
  const v2 = [8, 1, 0];

  const result = vector.subtract(v1, 0, v2, 0);
  assertEqual(result[0], -4);
  assertEqual(result[1], -4);
  assertEqual(result[2], 2);
}

function testDotProduct() {
  const v1 = [-6, 1, -1];
  const v2 = [5, 0, 5];

  const result = vector.dotProduct(v1, 0, v2, 0);
  assertEqual(result, -35);
}

function testCrossProduct() {
  const v1 = [2, 3, -1];
  const v2 = [1, 4, 0];

  const result = vector.crossProduct(v1, 0, v2, 0);
  assertEqual(result[0], 4);
  assertEqual(result[1], -1);
  assertEqual(result[2], 5);
}

runTests();
