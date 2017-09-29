'use strict';

/**
 * This class maintains and manipulates position and facing information.
 */

const matrix = require('./matrix.js');

class Camera {
  constructor(x, y, z, radiansRight, radiansUp, fovRadians) {
    this.model = matrix.createIdentityMat4();
    this.projection = matrix.createPerspective(fovRadians, 1, 1, 100);
    this.projectionModel = matrix.createIdentityMat4();

    this.reset(x, y, z, radiansRight, radiansUp);
  }

  reset(x, y, z, radiansRight, radiansUp) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.xzAngle = radiansRight;
    this.yzAngle = radiansUp;
  }

  clone(camera) {
    this.x = camera.x;
    this.y = camera.y;
    this.z = camera.z;

    this.xzAngle = camera.xzAngle;
    this.yzAngle = camera.yzAngle;
  }

  /**
    * Moves forward relative to the ground, not the forward facing vector.
    */
  moveForward(amount) {
    this.x += Math.sin(this.xzAngle) * amount;
    this.z += Math.cos(this.xzAngle) * amount;
  }

  /**
   * Moves to the right relative to the ground.
   */
  moveRight(amount) {
    this.x += Math.cos(this.xzAngle) * amount;
    this.z += -Math.sin(this.xzAngle) * amount;
  }

  /**
   * Moves up and down regardless of facing.
   */
  moveUp(amount) {
    this.y += amount;
  }

  rotateRight(radians) {
    this.xzAngle = (this.xzAngle + radians) % (2 * Math.PI);
  }

  /**
     * Up-down rotation is restricted to [-pi/2, pi/2] to make the camera easier to control.
     */
  rotateUp(radians) {
    const minAngle = -.5 * Math.PI;
    const maxAngle = -minAngle;
    this.yzAngle = Math.max(Math.min(this.yzAngle + radians, maxAngle), minAngle);
  }

  /**
 * Left-right rotation is applied before Up-down rotation.
 */
  getUpdatedProjectionModel() {
    matrix.setIdentityMat4(this.model);
    // x, y, z are negative because objects move opposite to the direction the camera is moving
    matrix.translateMat4(this.model, -this.x, -this.y, -this.z);
    matrix.applyXZRotationMat4(this.model, this.xzAngle);
    matrix.applyYZRotationMat4(this.model, -this.yzAngle);

    matrix.multiplyMat4ByMat4(this.projection, this.model, this.projectionModel);
    return this.projectionModel;
  }
}

module.exports = Camera;
