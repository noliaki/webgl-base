attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
uniform mat4 mvp;
uniform float uTime;
varying vec4 vColor;

mat4 rotationX( in float angle ) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, cos(angle), -sin(angle), 0.0,
    0.0, sin(angle), cos(angle), 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

mat4 rotationY( in float angle ) {
  return mat4(
    cos(angle), 0.0, sin(angle), 0.0,
    0.0, 1.0, 0.0, 0.0,
    -sin(angle), 0.0, cos(angle), 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

mat4 rotationZ( in float angle ) {
  return mat4(
    cos(angle), -sin(angle), 0.0, 0.0,
    sin(angle), cos(angle), 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

void main(void){
  vColor = aColor;
  vec4 p = vec4(
    aPosition.x * sin(uTime / 1000.0),
    aPosition.y * sin(uTime / 1500.0),
    aPosition.z * sin(uTime / 3000.0),
    1.0
  );
  // p = p * rotationZ(uTime / 500.0);

  gl_Position = mvp * p;
  // gl_PointSize = 20.0;
}
