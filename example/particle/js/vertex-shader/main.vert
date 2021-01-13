attribute vec3 aPosition;
attribute vec3 aNormal;
// attribute vec4 aColor;
attribute vec3 aStagger;
attribute vec3 aCenter;
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

vec3 hsv(float h, float s, float v){
  vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
  return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main(void){
  vColor = vec4(
    hsv(mod(uTime * 0.0002, 10.0) + snoise(aStagger) * 0.5, 0.8, 0.8), //* (snoise(vec3(aStagger.xz, uTime / (aStagger.y * 1000.0 + 1000.0))) + 1.0) / 2.0,
    1.0
  );

  vec3 center = aPosition - aCenter;

  mat4 rotation =
    rotationX(uTime / (2000.0 * aStagger.x + 1000.0)) *
    rotationY(uTime / (2000.0 * aStagger.y + 1000.0)) *
    rotationZ(uTime / (2000.0 * aStagger.z + 1000.0));

  vec4 np = vec4(aNormal - aCenter, 1.0);
  vNormal = (np * rotation).xyz + aCenter;

  vec4 p = vec4(center, 1.0) * rotation;
  // p = vec4(
  //   p.x + 0.03 * snoise(vec3(aStagger.xy, uTime * (aStagger.z) * 0.0003)),
  //   p.y + 0.03 * snoise(vec3(aStagger.yz, uTime * (aStagger.x) * 0.0003)),
  //   p.z + 0.03 * snoise(vec3(aStagger.zx, uTime * (aStagger.y) * 0.0003)),
  //   1.0
  // );

  gl_Position = uMvp * vec4(
    p.xyz + aCenter.xyz,
    1.0
  );
  // gl_PointSize = 20.0;
}
