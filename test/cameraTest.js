'use strict';

/**
 * Tests for the Camera modules.
 */

const CPUCamera = require('../scripts/cpu/Camera.js');
const GPUCamera = require('../scripts/gpu/Camera.js');

function runTests() {
  testConstructor();
  testReset();
  testClone();
  testRotateRight();
  testRotateUp();
  testMoveForward();
  testMoveRight();
  testMoveUp();

  console.log('All camera tests passed.');
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`${String(actual)} !== ${String(expected)}`);
  }
}

function testConstructor() {
  const cpuCamera = new CPUCamera(1, 2, 3, 4, 5);
  const gpuCamera = new GPUCamera(1, 2, 3, 4, 5);

  assertEqual(cpuCamera.x, 1);
  assertEqual(gpuCamera.x, 1);

  assertEqual(cpuCamera.y, 2);
  assertEqual(gpuCamera.y, 2);

  assertEqual(cpuCamera.z, 3);
  assertEqual(gpuCamera.z, 3);

  assertEqual(cpuCamera.xzAngle, 4);
  assertEqual(gpuCamera.xzAngle, 4);

  assertEqual(cpuCamera.yzAngle, 5);
  assertEqual(gpuCamera.yzAngle, 5);
}

function testReset() {
  const cpuCamera = new CPUCamera(0, 0, 0, 0, 0);
  const gpuCamera = new GPUCamera(0, 0, 0, 0, 0);

  cpuCamera.reset(1, 2, 3, 4, 5);
  gpuCamera.reset(1, 2, 3, 4, 5);

  assertEqual(cpuCamera.x, 1);
  assertEqual(gpuCamera.x, 1);

  assertEqual(cpuCamera.y, 2);
  assertEqual(gpuCamera.y, 2);

  assertEqual(cpuCamera.z, 3);
  assertEqual(gpuCamera.z, 3);

  assertEqual(cpuCamera.xzAngle, 4);
  assertEqual(gpuCamera.xzAngle, 4);

  assertEqual(cpuCamera.yzAngle, 5);
  assertEqual(gpuCamera.yzAngle, 5);
}

function testClone() {
  const cpuCamera = new CPUCamera(0, 0, 0, 0, 0);
  const gpuCamera = new GPUCamera(1, 2, 3, 4, 5);

  cpuCamera.clone(gpuCamera);

  assertEqual(cpuCamera.x, 1);
  assertEqual(cpuCamera.y, 2);
  assertEqual(cpuCamera.z, 3);
  assertEqual(cpuCamera.xzAngle, 4);
  assertEqual(cpuCamera.yzAngle, 5);

  cpuCamera.reset(6, 7, 8, 9, 10);
  gpuCamera.clone(cpuCamera);

  assertEqual(gpuCamera.x, 6);
  assertEqual(gpuCamera.y, 7);
  assertEqual(gpuCamera.z, 8);
  assertEqual(gpuCamera.xzAngle, 9);
  assertEqual(gpuCamera.yzAngle, 10);
}

function testRotateRight() {
  const cpuCamera = new CPUCamera(0, 0, 0, 0, 0);
  const gpuCamera = new GPUCamera(0, 0, 0, 0, 0);

  cpuCamera.rotateRight(Math.PI);
  gpuCamera.rotateRight(Math.PI);

  assertEqual(cpuCamera.xzAngle, Math.PI);
  assertEqual(gpuCamera.xzAngle, Math.PI);

  cpuCamera.rotateRight(Math.PI);
  gpuCamera.rotateRight(Math.PI);

  assertEqual(cpuCamera.xzAngle, 0);
  assertEqual(gpuCamera.xzAngle, 0);

  cpuCamera.rotateRight(-Math.PI);
  gpuCamera.rotateRight(-Math.PI);

  assertEqual(cpuCamera.xzAngle, -Math.PI);
  assertEqual(gpuCamera.xzAngle, -Math.PI);
}

function testRotateUp() {
  const cpuCamera = new CPUCamera(0, 0, 0, 0, 0);
  const gpuCamera = new GPUCamera(0, 0, 0, 0, 0);

  cpuCamera.rotateUp(Math.PI / 4);
  gpuCamera.rotateUp(Math.PI / 4);

  assertEqual(cpuCamera.yzAngle, Math.PI / 4);
  assertEqual(gpuCamera.yzAngle, Math.PI / 4);

  cpuCamera.rotateUp(Math.PI / 2);
  gpuCamera.rotateUp(Math.PI / 2);

  assertEqual(cpuCamera.yzAngle, Math.PI / 2);
  assertEqual(gpuCamera.yzAngle, Math.PI / 2);

  cpuCamera.reset(0, 0, 0, 0, 0);
  cpuCamera.reset(0, 0, 0, 0, 0);

  cpuCamera.rotateUp(-Math.PI);
  gpuCamera.rotateUp(-Math.PI);

  assertEqual(cpuCamera.yzAngle, -Math.PI / 2);
  assertEqual(gpuCamera.yzAngle, -Math.PI / 2);
}

function testMoveForward() {
  const cpuCamera = new CPUCamera(0, 0, 0, 0, 0);
  const gpuCamera = new GPUCamera(0, 0, 0, 0, 0);

  cpuCamera.moveForward(1);
  gpuCamera.moveForward(1);

  assertEqual(cpuCamera.z, 1);
  assertEqual(gpuCamera.z, 1);

  cpuCamera.moveForward(-2);
  gpuCamera.moveForward(-2);

  assertEqual(cpuCamera.z, -1);
  assertEqual(gpuCamera.z, -1);

  cpuCamera.rotateRight(Math.PI / 2);
  gpuCamera.rotateRight(Math.PI / 2);

  cpuCamera.moveForward(2);
  gpuCamera.moveForward(2);

  assertEqual(cpuCamera.x, 2);
  assertEqual(gpuCamera.x, 2);

  cpuCamera.rotateUp(Math.PI / 2);
  gpuCamera.rotateUp(Math.PI / 2);

  cpuCamera.moveForward(3);
  gpuCamera.moveForward(3);

  assertEqual(cpuCamera.x, 5);
  assertEqual(cpuCamera.y, 0);
  assertEqual(gpuCamera.x, 5);
  assertEqual(gpuCamera.y, 0);
}

function testMoveRight() {
  const cpuCamera = new CPUCamera(0, 0, 0, 0, 0);
  const gpuCamera = new GPUCamera(0, 0, 0, 0, 0);

  cpuCamera.moveRight(1);
  gpuCamera.moveRight(1);

  assertEqual(cpuCamera.x, 1);
  assertEqual(gpuCamera.x, 1);

  cpuCamera.moveRight(-2);
  gpuCamera.moveRight(-2);

  assertEqual(cpuCamera.x, -1);
  assertEqual(gpuCamera.x, -1);

  cpuCamera.rotateRight(Math.PI / 2);
  gpuCamera.rotateRight(Math.PI / 2);

  cpuCamera.moveRight(2);
  gpuCamera.moveRight(2);

  assertEqual(cpuCamera.z, -2);
  assertEqual(gpuCamera.z, -2);

  cpuCamera.rotateUp(Math.PI / 2);
  gpuCamera.rotateUp(Math.PI / 2);

  cpuCamera.moveRight(3);
  gpuCamera.moveRight(3);

  assertEqual(cpuCamera.z, -5);
  assertEqual(cpuCamera.y, 0);
  assertEqual(gpuCamera.z, -5);
  assertEqual(gpuCamera.y, 0);
}

function testMoveUp() {
  const cpuCamera = new CPUCamera(0, 0, 0, 0, 0);
  const gpuCamera = new GPUCamera(0, 0, 0, 0, 0);

  cpuCamera.moveUp(1);
  gpuCamera.moveUp(1);

  assertEqual(cpuCamera.y, 1);
  assertEqual(gpuCamera.y, 1);

  cpuCamera.moveUp(-2);
  gpuCamera.moveUp(-2);

  assertEqual(cpuCamera.y, -1);
  assertEqual(gpuCamera.y, -1);

  cpuCamera.rotateRight(Math.PI / 2);
  gpuCamera.rotateRight(Math.PI / 2);

  cpuCamera.moveUp(2);
  gpuCamera.moveUp(2);

  assertEqual(cpuCamera.y, 1);
  assertEqual(gpuCamera.y, 1);

  cpuCamera.rotateUp(Math.PI / 2);
  gpuCamera.rotateUp(Math.PI / 2);

  cpuCamera.moveUp(3);
  gpuCamera.moveUp(3);

  assertEqual(cpuCamera.y, 4);
  assertEqual(gpuCamera.y, 4);
}

runTests();
