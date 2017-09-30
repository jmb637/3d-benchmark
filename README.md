## 3D Benchmark

This repository contains a 3D CPU renderer, a 3D WebGL GPU renderer, and an interactive web benchmark for comparing the two.

Both renderers have a similar design and are fairly minimal. The renderers are capable of drawing 3D models, given by the coordinates of their triangles. The back-face culling optimization is used, requiring 3D models to be closed and front-facing triangles to have a counterclockwise winding.

To make navigation less disorienting, the cameras don't support spinning and all camera movement is made relative to the ground plane.

The CPU renderer starts by mapping the local coordinates of its provided 3D model to the global coordinates given by the caller. Back-face culling is then applied. If the triangle is front-facing, the coordinates of the triangle are projected to screen coordinates based on the canvas size, field of view, and the position of the global coordinates relative to the camera's position and facing. Next, the screen projected triangle is prepared to be drawn horizontally line by line from top to bottom. Linear interpolation is used to determine where each horizontal line should start and begin and the depth of each pixel in the line. The line is clipped to the viewing frustum and drawn to the bitmap pixel by pixel. The depth of each pixel is stored and checked by the bitmap to guarantee the correct ordering of 3D objects. Finally, the bitmap is pushed to the canvas. 

The GPU renderer follows a similar rendering process, but most rendering operations are abstracted away by WebGL and executed by the GPU in a highly parallel manner.

The controller manages user interaction and importantly handles switching between the two renderers seamlessly. The camera of the renderer that is being switched to receives all of the state of the previous camera, guaranteeing that the same exact scene will be rendered.

### Browser compatibility

This project does not make any attempts to accommodate older browsers. HTML5 and ES6 language features are used. To preserve the readability of the actual built JavaScript, no polyfills or transpilers are employed in the build process.
