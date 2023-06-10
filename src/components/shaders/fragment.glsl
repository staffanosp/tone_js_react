precision highp float;

uniform float uTime;
uniform float bass;
uniform float mids;
uniform float highs;

varying vec2 vUv;

// void main() {
//     gl_FragColor.rgb = 0.5 + 0.3 * cos(vUv.xyx + uTime);
//     gl_FragColor.a = 1.0;
// }

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
    vec2 uv = vUv;
    float time = uTime + abs(bass) * 2.5;

    for(float i = 1.0; i < 100.0; i++) {
        uv.x += cos(time * 0.2) / i * sin(i * 1.5 * uv.y + time * 0.05);
        uv.y += sin(time * 0.2) / i * cos(i * 1.5 * uv.x + time * 0.05);
    }
    float pattern = 0.5 / abs(sin(time - uv.y - uv.x));

    float hue = time * 0.005 + 0.4;
    //hue = 1.0;

    // vec3 hsv1 = vec3(hue, 0.9, 0.85);
    // vec3 hsv2 = vec3(hue + 0.07, 0.85, 0.75);

    // vec3 rgb1 = hsv2rgb(hsv1);
    // vec3 rgb2 = hsv2rgb(hsv2);

    // vec4 color = vec4(mix(rgb1, rgb2, pattern * bass - 1.5 * bass), 1.0);

    vec4 color = vec4(pattern) - 0.52;

    gl_FragColor = color;
}