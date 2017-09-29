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

  matrix[0] = 1 / (tanAngle * aspectRatio);
  matrix[5] = 1 / tanAngle;
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
