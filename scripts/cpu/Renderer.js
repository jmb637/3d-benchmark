'use strict';

/**
 * Renders 3D images from triangles given by the coords of their vertices.
 * The back-face culling optimization is used. Therefore, a triangle's vertices need 
 * to be given in counter-clockwise order for the side that should be displayed.
 * Once each of a triangle's vertices is projected, the triangle is drawn to a bitmap
 * from top to bottom with horizontal lines using linear interpolation.
 */

const ZBufferedBitmap = require('./ZBufferedBitmap.js');
const vector = require('./vector.js');

class Renderer {
  constructor(canvas, localTriangles, fovRadians) {
    this.canvas = canvas;
    this.localTriangles = localTriangles;
    this.viewingAngle = fovRadians;
    this.viewingAngleTanValue = Math.tan(this.viewingAngle / 2);
    this.minViewingDistance = 0;
    this.maxViewingDistance = 100;
    this.bmp = new ZBufferedBitmap(canvas.getContext("2d"));
  }

  draw(camera, positionVectors) {
    this.bmp.clearBuffer(0, 0, 0, 255);

    for (let i = 0; i < positionVectors.length; i += vector.vIndex(1)) {
      // Convert local coords to global coords.
      const positionedTriangles = [];
      for (let j = 0; j < this.localTriangles.length; ++j) {
        positionedTriangles[j] = this.localTriangles[j] + positionVectors[i + (j % 3)];
      }

      for (let j = 0; j < positionedTriangles.length; j += vector.tIndex(1)) {
        // Apply back-face culling.
        if (!this.triangleIsFacingCamera(camera, positionedTriangles, j)) {
          continue;
        }

        const projectionVectors = [];
        for (let k = 0; k < 3; ++k) {
          projectionVectors[k] = this.projectVector(
            camera,
            positionedTriangles,
            j + vector.vIndex(k)
          );
        }

        this.drawProjectedTriangle(projectionVectors);
      }
    }

    this.bmp.draw();
  }

  triangleIsFacingCamera(camera, triangles, index) {
    const vectorA = vector.subtract(triangles, index + vector.vIndex(1), triangles, index);
    const vectorB = vector.subtract(triangles, index + vector.vIndex(2), triangles, index);
    const normalVector = vector.crossProduct(vectorA, 0, vectorB, 0);

    const relativeVector = vector.subtract(triangles, index, camera.getPosition(), 0);
    return vector.dotProduct(relativeVector, 0, normalVector, 0) >= 0;
  }

  projectVector(camera, triangles, index) {
    const relativeVector = vector.subtract(triangles, index, camera.getPosition(), 0);
    const depth = vector.dotProduct(camera.getForwardFacing(), 0, relativeVector, 0);

    const x = vector.dotProduct(camera.getRightFacing(), 0, relativeVector, 0);
    const y = vector.dotProduct(camera.getUpFacing(), 0, relativeVector, 0);

    // viewingAngleTanValue is used as the minimum projection length.
    const projectionLength = Math.max(
      Math.abs(depth) * this.viewingAngleTanValue,
      this.viewingAngleTanValue
    );
    const normalizedX = ((x / projectionLength) + 1) / 2;
    // y needs to be negative because y values for a screen decrease from top to bottom
    const normalizedY = ((-y / projectionLength) + 1) / 2;

    return [normalizedX * this.canvas.width, normalizedY * this.canvas.height, depth];
  }

  drawProjectedTriangle(triangle) {
    // The orientation of the triangle needs to be determined to apply interpolation correctly
    // in the next step.
    triangle.sort((a, b) => vector.getY(a, 0) - vector.getY(b, 0));

    let yBegin = Math.max(vector.getY(triangle[0]), 0);
    let yEnd = Math.min(vector.getY(triangle[1]), this.canvas.height);
    const longSideX = this.interpolate(
      vector.getY(triangle[1]),
      vector.getY(triangle[0]),
      vector.getY(triangle[2]),
      vector.getX(triangle[0]),
      vector.getX(triangle[2])
    );

    if (vector.getX(triangle[1]) <= longSideX) {
      this.drawRegion(yBegin, yEnd, triangle[0], triangle[1], triangle[0], triangle[2]);

      yBegin = yEnd;
      yEnd = Math.min(vector.getY(triangle[2]), this.canvas.height);
      this.drawRegion(yBegin, yEnd, triangle[1], triangle[2], triangle[0], triangle[2]);
    } else {
      this.drawRegion(yBegin, yEnd, triangle[0], triangle[2], triangle[0], triangle[1]);

      yBegin = yEnd;
      yEnd = Math.min(vector.getY(triangle[2]), this.canvas.height);
      this.drawRegion(yBegin, yEnd, triangle[0], triangle[2], triangle[1], triangle[2]);
    }

  }

  drawRegion(yBegin, yEnd, leftVectorBegin, leftVectorEnd, rightVectorBegin, rightVectorEnd) {
    for (let y = yBegin; y <= yEnd; ++y) {
      const xBegin = Math.max(this.interpolate(
        y,
        vector.getY(leftVectorBegin),
        vector.getY(leftVectorEnd),
        vector.getX(leftVectorBegin),
        vector.getX(leftVectorEnd)
      ), 0);

      const xEnd = Math.min(this.interpolate(
        y,
        vector.getY(rightVectorBegin),
        vector.getY(rightVectorEnd),
        vector.getX(rightVectorBegin),
        vector.getX(rightVectorEnd)
      ), this.canvas.width);

      const zBegin = this.interpolate(
        y,
        vector.getY(leftVectorBegin),
        vector.getY(leftVectorEnd),
        vector.getZ(leftVectorBegin),
        vector.getZ(leftVectorEnd)
      );

      const zEnd = this.interpolate(
        y,
        vector.getY(rightVectorBegin),
        vector.getY(rightVectorEnd),
        vector.getZ(rightVectorBegin),
        vector.getZ(rightVectorEnd)
      );

      const allBefore = zBegin < this.minViewingDistance && zEnd < this.minViewingDistance;
      const allAfter = zBegin > this.maxViewingDistance && zEnd > this.maxViewingDistance;
      if (allBefore || allAfter) {
        continue;
      }

      if (zEnd - zBegin === 0) {
        this.drawHorizontalLineConstantZ(xBegin, xEnd, y, zBegin);
      }

      const z = Math.max(Math.min(zBegin, this.maxViewingDistance), this.minViewingDistance);
      const x = this.interpolate(z, zBegin, zEnd, xBegin, xEnd);
      const deltaZ = this.interpolate(x + 1, xBegin, xEnd, zBegin, zEnd) - z;
      this.drawHorizontalLine(x, xEnd, y, z, deltaZ);
    }
  }

  drawHorizontalLineConstantZ(beginX, endX, y, z) {
    for (let x = beginX; x <= endX; ++x) {
      this.bmp.setPixel(Math.round(x), Math.round(y), z, 255, 255, 255, 255);
    }
  }

  drawHorizontalLine(beginX, endX, y, beginZ, deltaZ) {
    let x = beginX;
    let z = beginZ;

    if (deltaZ < 0) {
      while (x <= endX && z >= this.minViewingDistance) {
        this.bmp.setPixel(Math.round(x), Math.round(y), z, 255, 255, 255, 255);
        ++x
        z += deltaZ;
      }
    } else {
      while (x <= endX && z <= this.maxViewingDistance) {
        this.bmp.setPixel(Math.round(x), Math.round(y), z, 255, 255, 255, 255);
        ++x;
        z += deltaZ;
      }
    }
  }

  interpolate(value, rangeBegin, rangeEnd, targetBegin, targetEnd) {
    const relativeValue = (value - rangeBegin) / (rangeEnd - rangeBegin);
    return relativeValue * (targetEnd - targetBegin) + targetBegin;
  }
}

module.exports = Renderer;
