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
