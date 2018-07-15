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

function multiplyMat4ByMat4(matrixA, matrixB, matrixOut) {
  const result = createIdentityMat4();

  for (let c = 0; c < 4; ++c) {
    for (let r = 0; r < 4; ++r) {
      let sum = 0;
      for (let i = 0; i < 4; ++i) {
        sum += matrixA[r + i * 4] * matrixB[i + c * 4];
      }

      result[r + c * 4] = sum;
    }
  }

  for (let i = 0; i < matrixOut.length; ++i) {
    matrixOut[i] = result[i];
  }
}

function translateMat4(matrix, x, y, z) {
  matrix[12] += x;
  matrix[13] += y;
  matrix[14] += z;
}

function applyXZRotationMat4(matrix, radians) {
  const rotation = createIdentityMat4();
  rotation[0] = Math.cos(radians);
  rotation[8] = -Math.sin(radians);
  rotation[2] = Math.sin(radians);
  rotation[10] = Math.cos(radians);

  multiplyMat4ByMat4(rotation, matrix, matrix);
}

function applyYZRotationMat4(matrix, radians) {
  const rotation = createIdentityMat4();
  rotation[5] = Math.cos(radians);
  rotation[9] = Math.sin(radians);
  rotation[6] = -Math.sin(radians);
  rotation[10] = Math.cos(radians);

  multiplyMat4ByMat4(rotation, matrix, matrix);
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
