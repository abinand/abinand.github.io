#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float random(in vec2);
float noise (in vec2);

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // Scale the coordinate system
    vec2 pos = vec2(st*5.0);

    // Obtain noise value
    float n = noise(pos);

    // Treat noise as an signed distance function
    float d = length( abs(fract(st))) +  n;

    // Create color splatter and animate
    vec3 color = vec3(st.x, 0.5667, st.y);
    color +=  smoothstep(0.15, 0.2, sin(u_time + d));

    gl_FragColor = vec4(color,1.0);
}

float random (in vec2 st) {
    // Mulitplying sin of a dot product with a large number
    return fract(sin(dot(st.xy, vec2(22.9217,167.235))) * 82931.69260);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Qunitic interpolation 
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0)+10.0);

    // Mix 4 corners 
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}