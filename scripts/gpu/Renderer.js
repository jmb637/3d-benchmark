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
