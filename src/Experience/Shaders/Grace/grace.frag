precision highp float;

uniform float uTime;
uniform vec3 uColor;

/* =========================
   SIMPLE 2D VALUE NOISE
   ========================= */
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

float graceRing(float r, float angle, float timeOffset) {
    float speed = .3;
    float radius = (uTime - timeOffset) * speed;

    float thickness = 0.08;
    float wave = abs(r - radius);

    float ring = smoothstep(thickness, 0.0, wave);
    ring *= exp(-r * 3.6);

    float swirl = noise(vec2(
                angle * 3.0 * timeOffset + uTime * 1.2,
                r * 4.0
            ));

    ring *= smoothstep(0.35, 0.75, swirl);

    return ring;
}

/* =========================
   MAIN
   ========================= */
varying vec2 vUv;

void main() {

    /* ---- Centered UV ---- */
    vec2 uv = vUv * 2.0 - 1.0;
    // uv.x *= uResolution.x / uResolution.y;

    /* ---- Polar coordinates ---- */
    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    float ring1 = graceRing(r, angle, 0.0);
    float ring2 = graceRing(r, angle, 0.35);
    float ring3 = graceRing(r, angle, 0.7);

    /* ---- Final intensity ---- */
    // float intensity = ring + halo;
    float intensity = ring1 * 2.0+ ring2 * 2.0 + ring3 * 2.0;

    /* ---- Grace color ---- */
    vec3 color = uColor * intensity;

    /* ---- Output (additive) ---- */
    gl_FragColor = vec4(color, intensity);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
