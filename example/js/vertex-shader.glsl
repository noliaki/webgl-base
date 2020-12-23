attribute vec3 position;
uniform mat4 mvp;
uniform float uTime;

void main(void){
  gl_Position = mvp * vec4(
    position.x * (sin(uTime / 1000.0) + 1.0) / 2.0,
    position.y * (sin(uTime / 1900.0) + 1.0) / 2.0,
    position.z,
    1.0
  );
}
