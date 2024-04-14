uniform float uTime;
uniform vec4 uResolution;
uniform sampler2D uTexture;
uniform sampler2D uGrainTexture;

varying vec2 vUv;

float PI = 3.1415926533589793238;

void main(){
    vec4 grain = texture2D(uGrainTexture, vUv);

    float dist = length(vUv - vec2(.5));
    float radius = .49;

    if(dist > .5) discard;

    // Out Edge
    float outerEdge = pow(dist/radius, 110.0);
    float magOut = .5 - cos(outerEdge - 1.0);
    vec2 uvOut = dist < radius ? vUv + magOut * (vUv - vec2(.5)) : vUv;

    // Inner Edge
    float innerEdge = pow(dist/radius, -7.0);
    vec2 innerEdgePower = vec2(sin(vUv.x - .5), sin(vUv.y - .5));
    float magIn = .5 - cos(innerEdge - 1.0);
    vec2 uvIn = dist > radius ? vUv : (vUv - vec2(.5)) * magIn * innerEdgePower;

    vec2 uvDisplay = vUv + uvOut * 0.1 + uvIn * 0.1 + (grain.rg - vec2(.5)) * .1;
    vec4 color = texture2D(uTexture, uvDisplay);


    // gl_FragColor = color;
    // gl_FragColor = grain;
    // gl_FragColor = vec4(uvOut, 0.0, 1.0);
    gl_FragColor = color;
}