precision highp float;

uniform float uTime;
uniform vec3 uLightDirection;
varying vec4 vColor;
varying vec3 vNormal;

void main(void){
  vec3 normal = (normalize(vNormal) + 1.0) * 0.5;
  float light = dot(normal, uLightDirection);
  gl_FragColor = vec4(vColor.rgb * light, vColor.a);
}
