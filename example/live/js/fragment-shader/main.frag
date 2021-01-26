uniform float uTime;
uniform vec2 uResolution;

uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D self;

uniform vec2 texResolution;

// uniform sampler2D texFilter;
// uniform vec2 texFilterResolution;

const float scale = 1.8;
const float maxDelay = 0.5;
const float duration = 1.0 - maxDelay;
const float timeRate = 0.002;
const float PI = 3.141592653589793;


// uniform vec3 uLightDirection;
// varying vec4 vColor;
// varying vec3 vNormal;

vec2 imageRatio(vec2 resolution, vec2 imageResolution) {
  return vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
}

vec2 imageUv(vec2 resolution, vec2 imageResolution, vec2 uv){
  vec2 ratio = imageRatio(resolution, imageResolution);

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main(void){
  // float sinTime = sin(uTime * timeRate);
  vec2 uv = vec2(gl_FragCoord.x / uResolution.x, 1.0 - gl_FragCoord.y / uResolution.y);
  // float delay = ((abs(uv.x * 2.0 - 1.0) + abs(uv.y * 2.0 - 1.0)) * 0.5);
  // float progress = clamp(((sinTime + 1.0) * 0.5) - delay * maxDelay, 0.0, duration) / duration;
  // float revProgress = 1.0 - progress;
  // float currentScale = progress < 0.5
  //   ? (1.0 - smoothstep(0.0, 0.5, progress)) * (1.0 / scale) + 1.0 - (1.0 / scale)
  //   : smoothstep(0.5, 1.0, progress) * (1.0 / scale) + 1.0 - (1.0 / scale);
  float noise = (snoise(vec3(uv, uTime * 0.0003)) + 1.0) / 2.0;
  vec2 texPix = imageUv(uResolution, texResolution, uv) * 2.0 - 1.0;

  // vec2 p = (gl_FragCoord.xy / min(uResolution.x, uResolution.y)) * 2.0 - 1.0;

  // vec4 filterColor = texture2D(texFilter, uv * (noise + 1.0) * 0.5);
  // float filterAvg = (((filterColor.x + filterColor.y + filterColor.z) / 3.0) * 2.0 - 1.0);

  vec4 tex1Color = texture2D(
    tex1,
    uv
  );
  vec4 tex2Color = texture2D(
    tex2,
    uv
  );
  vec4 selfColor = texture2D(
    self,
    uv
  );

  vec4 diffColor = abs(tex1Color - tex2Color);
  float diffAvg = 1.0 - (diffColor.x + diffColor.y + diffColor.z) / 3.0;

  gl_FragColor = vec4(
    noise - diffColor.rgb,
    1.0
  );
}
