precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D tex1;
uniform vec2 tex1Resolution;
uniform sampler2D tex2;
uniform vec2 tex2Resolution;
uniform sampler2D texFilter;
uniform vec2 texFilterResolution;

// uniform vec3 uLightDirection;
// varying vec4 vColor;
// varying vec3 vNormal;

void main(void){
  float rateH = min((uResolution.y / uResolution.x) / (tex2Resolution.y / tex2Resolution.x), 1.0);
  float rateR = uResolution.y / uResolution.x;
  // vec3 normal = abs(normalize(vNormal));
  // float light = dot(normal, uLightDirection);
  vec2 p = (gl_FragCoord.xy / min(uResolution.x, uResolution.y)) * 2.0 - 1.0;
  gl_FragColor = texture2D(
    tex2,
    vec2(
      gl_FragCoord.x / uResolution.x,
      -((1.0 - rateH) * 0.5 + (gl_FragCoord.y / uResolution.y) * rateH)
    )
  );
}
