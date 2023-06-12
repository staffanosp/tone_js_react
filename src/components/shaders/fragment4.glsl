precision highp float;

uniform float uTime;
uniform float bass;
uniform vec2 modPos;

varying vec2 vUv;

#define NUM_OCTAVES 5

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x), mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res * res;
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for(int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main(void) {
    vec2 uv = -1. + 2. * vUv;
    //normalize uv (square);

    // uv += modPos;

    float bassDistance = distance(uv, vec2(0.0)); //distance from center

    float bassStrength = smoothstep(1.0, 0.5, bassDistance + bass * 5.);

    vec4 color = vec4(0.0, 0., 0., 1.0);

    gl_FragColor = color + vec4(bassStrength);
}