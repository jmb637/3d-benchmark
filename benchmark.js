(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Handles user input and manages the state of the UI.
 */

const CPUCamera = require('./cpu/Camera.js');
const CPURenderer = require('./cpu/Renderer.js');
const GPUCamera = require('./gpu/Camera.js');
const GPURenderer = require('./gpu/Renderer.js');

window.addEventListener('DOMContentLoaded', () => {
  const cube = getCube();

  const cpuCamera = new CPUCamera(0, 0, -5, 0, 0);
  // Two separate canvases are needed because a canvas can only provide one type of drawing context.
  const cpuCanvas = document.getElementById('cpu_canvas');
  const cpuRenderer = new CPURenderer(cpuCanvas, cube, Math.PI / 2, 4 / 3);

  const gpuCamera = new GPUCamera(0, 0, -5, 0, 0, Math.PI / 2, 4 / 3);
  const gpuCanvas = document.getElementById('gpu_canvas');
  const gpuRenderer = new GPURenderer(gpuCanvas, cube);

  let cubeFactor = 1;
  let cubePositionVectors;
  updateCubes();

  let activeRenderer = cpuRenderer;
  let activeCamera = cpuCamera;

  const rendererType = document.getElementById('renderer_type');
  rendererType.innerText = 'CPU-based';

  const fpsLabel = document.getElementById('fps');
  let lastFrame = null;
  // A rough sort of moving average is used to smooth out FPS spikes.
  let movingFPS = 30;
  let fpsUpdateElapsed = 400;
  // requestAnimationFrame will impose an upper limit on the refresh rate.
  window.requestAnimationFrame(function draw() {
    const now = performance.now();
    if (lastFrame !== null) {
      fpsUpdateElapsed += now - lastFrame;
      const fps = 1000 / (now - lastFrame);
      movingFPS = (fps + 2 * movingFPS) / 3;

      // Updates to the FPS display are rate limited to improve readability.
      if (fpsUpdateElapsed > 400) {
        fpsLabel.innerText = Math.round(movingFPS);
        fpsUpdateElapsed = 0;
      }
    }
    lastFrame = now;

    activeRenderer.draw(activeCamera, cubePositionVectors);
    window.requestAnimationFrame(draw);
  });

  const changeRenderer = document.getElementById('change_renderer');
  // All camera state is passed to the other camera to provide a seamless transition.
  changeRenderer.addEventListener('click', () => {
    if (activeRenderer === cpuRenderer) {
      activeRenderer = gpuRenderer;
      gpuCamera.clone(activeCamera);
      activeCamera = gpuCamera;

      cpuCanvas.style.display = 'none';
      gpuCanvas.style.display = 'inline';

      rendererType.innerText = 'GPU-based';
    } else {
      activeRenderer = cpuRenderer;
      cpuCamera.clone(activeCamera);
      activeCamera = cpuCamera;

      gpuCanvas.style.display = 'none';
      cpuCanvas.style.display = 'inline';

      rendererType.innerText = 'CPU-based';
    }
  });

  const addCubes = document.getElementById('add_cubes');
  addCubes.addEventListener('click', () => {
    ++cubeFactor;
    updateCubes();
  });

  const removeCubes = document.getElementById('remove_cubes');
  // At least one cube must be drawn.
  removeCubes.addEventListener('click', () => {
    cubeFactor = Math.max(cubeFactor - 1, 1);
    updateCubes();
  });

  // The active renderer isn't reset to the CPU renderer.
  const reset = document.getElementById('reset');
  reset.addEventListener('click', () => {
    cubeFactor = 1;
    updateCubes();
    activeCamera.reset(0, 0, -5, 0, 0);
  });

  // Cubes are added as a cube of smaller cubes.
  function updateCubes() {
    cubePositionVectors = [];
    for (let i = 0; i < cubeFactor; ++i) {
      for (let j = 0; j < cubeFactor; ++j) {
        for (let k = 0; k < cubeFactor; ++k) {
          cubePositionVectors.push(i * 4);
          cubePositionVectors.push(j * 4);
          cubePositionVectors.push(k * 4);
        }
      }
    }

    const cubeCount = document.getElementById('cube_count');
    cubeCount.innerText = cubeFactor ** 3;
  }

  // A timer based system is used to remove the key repeat delay after initial key press on
  // holding a key down.
  const activeKeyCodeSet = new Set();
  let interval = null;
  window.addEventListener('keydown', (event) => {
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      event.preventDefault();
    }

    activeKeyCodeSet.add(event.keyCode);

    if (interval === null) {
      processActiveKeys();
      interval = window.setInterval(() => {
        processActiveKeys();
      }, 30);
    }
  });

  window.addEventListener('keyup', (event) => {
    activeKeyCodeSet.delete(event.keyCode);

    if (activeKeyCodeSet.size === 0) {
      window.clearInterval(interval);
      interval = null;
    }
  });

  function processActiveKeys() {
    const distance = 1;
    const rotation = (4 / 180) * Math.PI;

    for (let keyCode of activeKeyCodeSet) {
      switch (keyCode) {
        case 37:
          // "LeftArrow"
          activeCamera.rotateRight(-rotation);
          break;
        case 38:
          // "UpArrow"
          activeCamera.rotateUp(rotation);
          break;
        case 39:
          // "RightArrow"
          activeCamera.rotateRight(rotation);
          break;
        case 40:
          // "DownArrow"
          activeCamera.rotateUp(-rotation);
          break;
        case 87:
          // "KeyW"
          activeCamera.moveForward(distance);
          break;
        case 65:
          // "KeyA"
          activeCamera.moveRight(-distance);
          break;
        case 83:
          // "KeyS"
          activeCamera.moveForward(-distance);
          break;
        case 68:
          // "KeyD"
          activeCamera.moveRight(distance);
          break;
        case 81:
          // "KeyQ"
          activeCamera.moveUp(-distance);
          break;
        case 69:
          // "KeyE"
          activeCamera.moveUp(distance);
          break;
      }
    }
  }
});

/**
 * @return an array of local coords for a standard cube with side lengths = 2
 */
function getCube() {
  return [
    // Near
    -1, 1, -1,
    -1, -1, -1,
    1, 1, -1,
    1, -1, -1,
    1, 1, -1,
    -1, -1, -1,

    // Far
    1, 1, 1,
    1, -1, 1,
    -1, 1, 1,
    -1, -1, 1,
    -1, 1, 1,
    1, -1, 1,

    // Left
    -1, 1, 1,
    -1, -1, 1,
    -1, 1, -1,
    -1, -1, -1,
    -1, 1, -1,
    -1, -1, 1,

    // Right
    1, 1, -1,
    1, -1, -1,
    1, 1, 1,
    1, -1, 1,
    1, 1, 1,
    1, -1, -1,

    // Bottom
    -1, -1, -1,
    -1, -1, 1,
    1, -1, -1,
    1, -1, 1,
    1, -1, -1,
    -1, -1, 1,

    // Top
    -1, 1, 1,
    -1, 1, -1,
    1, 1, 1,
    1, 1, -1,
    1, 1, 1,
    -1, 1, -1
  ];
}

},{"./cpu/Camera.js":2,"./cpu/Renderer.js":3,"./gpu/Camera.js":6,"./gpu/Renderer.js":7}],2:[function(require,module,exports){
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

},{"./vector.js":5}],3:[function(require,module,exports){
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
  constructor(canvas, localTriangles, fovRadians, aspectRatio) {
    this.canvas = canvas;
    this.localTriangles = localTriangles;

    this.viewingAngleTanValue = Math.tan(fovRadians / 2);
    this.aspectRatio = aspectRatio;

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
    const depth = vector.dotProduct(camera.forwardFacing, 0, relativeVector, 0);

    const x = vector.dotProduct(camera.rightFacing, 0, relativeVector, 0);
    const y = vector.dotProduct(camera.upFacing, 0, relativeVector, 0);

    // viewingAngleTanValue is used as the minimum projection length.
    const xProjectionLength = Math.max(
      Math.abs(depth) * this.viewingAngleTanValue,
      this.viewingAngleTanValue
    );
    const yProjectionLength = xProjectionLength / this.aspectRatio;

    const normalizedX = ((x / xProjectionLength) + 1) / 2;
    // y needs to be negative because y values for a screen decrease from top to bottom
    const normalizedY = ((-y / yProjectionLength) + 1) / 2;

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

},{"./ZBufferedBitmap.js":4,"./vector.js":5}],4:[function(require,module,exports){
'use strict';

/**
 * Contains individual rgba pixel data and a depth value for each pixel to
 * determine which pixel should be drawn in front.
 */

class ZBufferedBitmap {
  constructor(context) {
    this.context = context;
    this.imageData = context.createImageData(context.canvas.width, context.canvas.height);
    this.zBuffer = new Float32Array(this.imageData.data.length);
  }

  clearBuffer(r, g, b, a) {
    const length = this.imageData.data.length;
    for (let i = 0; i < length; ++i) {
      this.imageData.data[i * 4] = r;
      this.imageData.data[i * 4 + 1] = g;
      this.imageData.data[i * 4 + 2] = b;
      this.imageData.data[i * 4 + 3] = a;
      this.zBuffer[i] = Number.POSITIVE_INFINITY;
    }
  }

  setPixel(x, y, z, r, g, b, a) {
    const pixelIndex = y * this.imageData.width + x;
    // Ignore this pixel if it is behind the current pixel.
    if (z >= this.zBuffer[pixelIndex]) {
      return;
    }

    this.imageData.data[pixelIndex * 4] = r;
    this.imageData.data[pixelIndex * 4 + 1] = g;
    this.imageData.data[pixelIndex * 4 + 2] = b;
    this.imageData.data[pixelIndex * 4 + 3] = a;
    this.zBuffer[pixelIndex] = z;
  }

  draw() {
    this.context.putImageData(this.imageData, 0, 0);
  }
}

module.exports = ZBufferedBitmap;

},{}],5:[function(require,module,exports){
'use strict';

/**
 * Contains standard vector operations. Vectors are represented as length 3 arrays or
 * as a larger array with an index for a length 3 sub-array.
 */

function add(trianglesA, indexA, trianglesB, indexB) {
  return [
    getX(trianglesA, indexA) + getX(trianglesB, indexB),
    getY(trianglesA, indexA) + getY(trianglesB, indexB),
    getZ(trianglesA, indexA) + getZ(trianglesB, indexB)
  ];
}

function subtract(trianglesA, indexA, trianglesB, indexB) {
  return [
    getX(trianglesA, indexA) - getX(trianglesB, indexB),
    getY(trianglesA, indexA) - getY(trianglesB, indexB),
    getZ(trianglesA, indexA) - getZ(trianglesB, indexB)
  ];
}

function dotProduct(trianglesA, indexA, trianglesB, indexB) {
  return getX(trianglesA, indexA) * getX(trianglesB, indexB) +
    getY(trianglesA, indexA) * getY(trianglesB, indexB) +
    getZ(trianglesA, indexA) * getZ(trianglesB, indexB);
}

function crossProduct(trianglesA, indexA, trianglesB, indexB) {
  return [
    getY(trianglesA, indexA) * getZ(trianglesB, indexB) - getZ(trianglesA, indexA) * getY(trianglesB, indexB),
    getZ(trianglesA, indexA) * getX(trianglesB, indexB) - getX(trianglesA, indexA) * getZ(trianglesB, indexB),
    getX(trianglesA, indexA) * getY(trianglesB, indexB) - getY(trianglesA, indexA) * getX(trianglesB, indexB)
  ];
}

function getX(triangles, index = 0) {
  return triangles[index];
}

function getY(triangles, index = 0) {
  return triangles[index + 1];
}

function getZ(triangles, index = 0) {
  return triangles[index + 2];
}

/**
 * Each vector has 3 coordinate values.
 */
function vIndex(i) {
  return i * 3;
}

/**
 * Each triangle has 9 individual coordinate values.
*/
function tIndex(i) {
  return i * 9;
}

exports.add = add;
exports.subtract = subtract;
exports.dotProduct = dotProduct;
exports.crossProduct = crossProduct;
exports.getX = getX;
exports.getY = getY;
exports.getZ = getZ;
exports.vIndex = vIndex;
exports.tIndex = tIndex;

},{}],6:[function(require,module,exports){
'use strict';

/**
 * This class maintains and manipulates position and facing information.
 */

const matrix = require('./matrix.js');

class Camera {
  constructor(x, y, z, radiansRight, radiansUp, fovRadians, aspectRatio) {
    this.model = matrix.createIdentityMat4();
    this.projection = matrix.createPerspective(fovRadians, aspectRatio, 1, 100);
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

},{"./matrix.js":8}],7:[function(require,module,exports){
'use strict';

/**
 * Uses WebGL to render 3D images from triangles given by the coords of their vertices.
 */

const matrix = require('./matrix.js');

class Renderer {
  constructor(canvas, localTriangles) {
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    this.shaderProgram = this.buildShaderProgram();
    this.initialize(localTriangles);
    this.triangleCount = localTriangles.length / 3;
  }

  draw(camera, positionVectors) {
    // The projection model is computed here because it only changes between frames.
    const projectionModel = camera.getUpdatedProjectionModel();

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    const u_projectionModel = this.gl.getUniformLocation(this.shaderProgram, 'u_projectionModel');
    this.gl.uniformMatrix4fv(u_projectionModel, false, projectionModel);

    for (let i = 0; i < positionVectors.length; i += 3) {
      const x = positionVectors[i];
      const y = positionVectors[i + 1];
      const z = positionVectors[i + 2];

      const view = matrix.createIdentityMat4();
      matrix.translateMat4(view, x, y, z);

      const u_view = this.gl.getUniformLocation(this.shaderProgram, 'u_view');
      this.gl.uniformMatrix4fv(u_view, false, view);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleCount);
    }
  }

  initialize(localTriangles) {
    this.gl.useProgram(this.shaderProgram);
    this.initializeBuffer(localTriangles);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
  }

  initializeBuffer(localTriangles) {
    this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.shaderProgram, 'a_position'));

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(localTriangles), this.gl.STATIC_DRAW);

    const a_position = this.gl.getAttribLocation(this.shaderProgram, 'a_position')
    this.gl.vertexAttribPointer(a_position, 3, this.gl.FLOAT, false, 0, 0);
  }

  buildShaderProgram() {
    // The shaders are embedded inside script elements in the HTML.
    const vertexSource = document.getElementById('shader-vs').innerHTML;
    const vertexShader = this.buildShader(vertexSource, this.gl.VERTEX_SHADER);

    const fragmentSource = document.getElementById('shader-fs').innerHTML;
    const fragmentShader = this.buildShader(fragmentSource, this.gl.FRAGMENT_SHADER);

    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      throw this.gl.getProgramInfoLog(shaderProgram);
    }

    return shaderProgram;
  }

  buildShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw this.gl.getShaderInfoLog(shader);
    }

    return shader;
  }
}

module.exports = Renderer;

},{"./matrix.js":8}],8:[function(require,module,exports){
'use strict';

function createIdentityMat4() {
  const matrix = new Float32Array(16);
  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;
  return matrix;
}

function setIdentityMat4(matrix) {
  for (let i = 0; i < matrix.length; ++i) {
    if (i % 5 === 0) {
      matrix[i] = 1;
    } else {
      matrix[i] = 0;
    }
  }
}

function multiplyMat4ByMat4(matrixA, matrixB, copyMatrix) {
  for (let c = 0; c < 4; ++c) {
    for (let r = 0; r < 4; ++r) {
      let sum = 0;
      for (let i = 0; i < 4; ++i) {
        sum += matrixA[r + i * 4] * matrixB[i + c * 4];
      }

      copyMatrix[r + c * 4] = sum;
    }
  }
}

function translateMat4(matrix, x, y, z) {
  matrix[12] += x;
  matrix[13] += y;
  matrix[14] += z;
}

function applyXZRotationMat4(matrix, radians) {
  const rot0 = Math.cos(radians);
  const rot8 = -Math.sin(radians);
  const rot2 = Math.sin(radians);
  const rot10 = Math.cos(radians);

  const out0 = rot0 * matrix[0] + rot8 * matrix[2];
  const out4 = rot0 * matrix[4] + rot8 * matrix[6];
  const out8 = rot0 * matrix[8] + rot8 * matrix[10];
  const out12 = rot0 * matrix[12] + rot8 * matrix[14];

  matrix[2] = rot2 * matrix[0] + rot10 * matrix[2];
  matrix[6] = rot2 * matrix[4] + rot10 * matrix[6];
  matrix[10] = rot2 * matrix[8] + rot10 * matrix[10];
  matrix[14] = rot2 * matrix[12] + rot10 * matrix[14];

  matrix[0] = out0;
  matrix[4] = out4;
  matrix[8] = out8;
  matrix[12] = out12;
}

function applyYZRotationMat4(matrix, radians) {
  const rot5 = Math.cos(radians);
  const rot9 = Math.sin(radians);
  const rot6 = -Math.sin(radians);
  const rot10 = Math.cos(radians);

  const out1 = rot5 * matrix[1] + rot9 * matrix[2];
  const out5 = rot5 * matrix[5] + rot9 * matrix[6];
  const out9 = rot5 * matrix[9] + rot9 * matrix[10];
  const out13 = rot5 * matrix[13] + rot9 * matrix[14];

  matrix[2] = rot6 * matrix[1] + rot10 * matrix[2];
  matrix[6] = rot6 * matrix[5] + rot10 * matrix[6];
  matrix[10] = rot6 * matrix[9] + rot10 * matrix[10];
  matrix[14] = rot6 * matrix[13] + rot10 * matrix[14];

  matrix[1] = out1;
  matrix[5] = out5;
  matrix[9] = out9;
  matrix[13] = out13;
}

function createPerspective(viewingAngleRadians, aspectRatio, near, far) {
  const matrix = new Float32Array(16);
  const tanAngle = Math.tan(viewingAngleRadians / 2);

  matrix[0] = 1 / tanAngle;
  matrix[5] = 1 / (tanAngle / aspectRatio);
  matrix[10] = (near + far) / (far - near);
  matrix[11] = 1;
  matrix[14] = (2 * near * far) / (near - far);

  return matrix;
}

exports.createIdentityMat4 = createIdentityMat4;
exports.setIdentityMat4 = setIdentityMat4;
exports.multiplyMat4ByMat4 = multiplyMat4ByMat4;
exports.translateMat4 = translateMat4;
exports.applyXZRotationMat4 = applyXZRotationMat4;
exports.applyYZRotationMat4 = applyYZRotationMat4;
exports.createPerspective = createPerspective;

},{}]},{},[1]);
