attribute vec2 uv;
attribute vec2 position;

// Rather than using a plane (two triangles) to cover the viewport here is a
// triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
// Excess will be out of the viewport.

//         position                uv
//      (-1, 3)                  (0, 2)
//         |\                      |\
//         |__\(1, 1)              |__\(1, 1)
//         |__|_\                  |__|_\
//   (-1, -1)   (3, -1)        (0, 0)   (2, 0)

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}
