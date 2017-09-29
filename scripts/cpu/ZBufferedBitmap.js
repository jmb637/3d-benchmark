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
