'use strict';

/**
 * This class maintains and manipulates position and facing information.
 */

const vector = require('./vector.js');

class Camera {
  constructor(x, y, z, radiansRight, radiansUp) {
    this.position = [];
    this.forwardFacing = [0, 0, 1];
    this.upFacing = [0, 1, 0];
    this.rightFacing = [1, 0, 0];

    this.reset(x, y, z, radiansRight, radiansUp);
  }

  reset(x, y, z, radiansRight, radiansUp) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.xzAngle = radiansRight;
    this.yzAngle = radiansUp;
    this.applyRotation();
  }

  clone(camera) {
    this.x = camera.x;
    this.y = camera.y;
    this.z = camera.z;

    this.xzAngle = camera.xzAngle;
    this.yzAngle = camera.yzAngle;
    this.applyRotation();
  }

  /**
   * @return a vector with (x, y, z) coords
   */
  getPosition() {
    this.position[0] = this.x;
    this.position[1] = this.y;
    this.position[2] = this.z;
    return this.position;
  }

  /**
   * @return a unit vector pointing in the direction the camera is facing
   */
  getForwardFacing() {
    return this.forwardFacing;
  }

  /**
   * @return a unit vector pointing to up relative to the direction the camera is facing
   */
  getUpFacing() {
    return this.upFacing;
  }

  /**
 * @return a unit vector pointing to the right relative to the direction the camera is facing
 */
  getRightFacing() {
    return this.rightFacing;
  }

  rotateRight(radians) {
    this.xzAngle = (this.xzAngle + radians) % (2 * Math.PI);
    this.applyRotation();
  }

  /**
   * Up-down rotation is restricted to [-pi/2, pi/2] to make the camera easier to control.
   */
  rotateUp(radians) {
    const minAngle = -.5 * Math.PI;
    const maxAngle = -minAngle;
    this.yzAngle = Math.max(Math.min(this.yzAngle + radians, maxAngle), minAngle);
    this.applyRotation();
  }

  /**
   * Left-right rotation is applied before Up-down rotation.
   */
  applyRotation() {
    this.forwardFacing[0] = Math.sin(this.xzAngle) * Math.cos(this.yzAngle);
    this.forwardFacing[1] = Math.sin(this.yzAngle);
    this.forwardFacing[2] = Math.cos(this.xzAngle) * Math.cos(this.yzAngle);

    this.rightFacing[0] = Math.cos(this.xzAngle);
    this.rightFacing[1] = 0
    this.rightFacing[2] = -Math.sin(this.xzAngle);

    this.upFacing[0] = -Math.sin(this.xzAngle) * Math.sin(this.yzAngle);
    this.upFacing[1] = Math.cos(this.yzAngle);
    this.upFacing[2] = -Math.cos(this.xzAngle) * Math.sin(this.yzAngle);
  }

  /**
   * Moves forward relative to the ground, not the forward facing vector.
   */
  moveForward(amount) {
    const xChange = amount * Math.sin(this.xzAngle);
    const zChange = amount * Math.cos(this.xzAngle);

    this.x += xChange;
    this.z += zChange;

  }

  /**
   * Moves to the right relative to the ground.
   */
  moveRight(amount) {
    const xChange = amount * Math.cos(this.xzAngle);
    const zChange = amount * -Math.sin(this.xzAngle);

    this.x += xChange;
    this.z += zChange;
  }

  /**
   * Moves up and down regardless of facing.
   */
  moveUp(amount) {
    this.y += amount;
  }
}

module.exports = Camera;
