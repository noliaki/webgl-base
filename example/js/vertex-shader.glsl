attribute vec3 position;
attribute vec2 textureCoord;
varying vec2 vUv;

void main(void){
  vUv = textureCoord;
  gl_Position = vec4(position, 1.0);
}
