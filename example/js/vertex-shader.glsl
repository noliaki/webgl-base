attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
uniform mat4 uMvp;
uniform float uTime;
varying vec4 vColor;
varying vec3 vNormal;

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

  mat4 rotation = rotationY(uTime / 2000.0);

  vec4 np = vec4(aNormal, 1.0);
  vNormal = (np * rotation).xyz;

  vec4 p = vec4(aPosition, 1.0);
  p = p * rotation;

  gl_Position = uMvp * p;
  // gl_PointSize = 20.0;
}
