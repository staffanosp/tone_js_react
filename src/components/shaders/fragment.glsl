precision highp float;

uniform float uTime;
uniform float bass;
uniform vec2 modPos;
uniform float bassCurrent;
uniform float mids;
uniform float highs;

varying vec2 vUv;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
    vec2 uv = vUv;
    float time = uTime;

    float mouseDistance = distance(vUv, modPos);
    float mouseStrength = smoothstep(0.5, 0.0, mouseDistance);

    float bassDistance = distance(vUv, vec2(0.5)); //distance from center
    float bassStrength = smoothstep(0.7, 0.0, bassDistance - bass);

    for(float i = 1.0; i < 100.0; i++) {
        uv.x += cos(time * 0.2) / i * sin(i * 1.5 * uv.y + time * 0.05);
        uv.y += sin(time * 0.2) / i * cos(i * 1.5 * uv.x + time * 0.05);
    }
    float pattern = (0.5 + bass * 0.1) / abs(sin(time - uv.y - uv.x - bass * 0.1));

    float hue = time * 0.05 + 0.4;
    hue += bass * 0.3;
    hue += sin(modPos.x * modPos.y) * 0.2;

    //Mids = 0.0 because theres not mids uniform lol
    vec3 hsv1 = vec3(hue * mids, 0.9, 0.85);
    vec3 hsv2 = vec3(hue + mids, 0.85, 0.75);

    vec3 rgb1 = hsv2rgb(hsv1);
    rgb1 = vec3(0., 0., 0.);
    vec3 rgb2 = hsv2rgb(hsv2);

    vec4 color = vec4(mix(rgb1, rgb2, pattern - mouseDistance), 1.0);
    // color -= vec4(mouseDistance, mouseDistance, mouseDistance, 1.0);
    // vec4 color = vec4(pattern) - 0.52;

    gl_FragColor = color;
}