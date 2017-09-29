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
