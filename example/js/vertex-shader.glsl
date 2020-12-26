attribute vec3 position;
attribute vec4 aColor;
uniform mat4 mvp;
uniform float uTime;
varying vec4 vColor;

void main(void){
  vColor = aColor;

  gl_Position = mvp * vec4(
    position.x * (sin(uTime / 1000.0) + 1.0) / 2.0,
    position.y * (sin(uTime / 1900.0) + 1.0) / 2.0,
    position.z,
    1.0
  );
  // gl_PointSize = 20.0;
}
