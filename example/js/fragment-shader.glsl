precision highp float;

uniform float uTime;

void main(void){
  gl_FragColor = vec4(
    (sin(uTime / 2000.0) + 1.0) / 2.0,
    0.7,
    (cos(uTime / 2500.0) + 1.0) / 2.0,
    1.0
  );
}
