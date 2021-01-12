uniform float uTime;
uniform vec2 uResolution;

uniform sampler2D tex1;
uniform vec2 tex1Resolution;

uniform sampler2D tex2;
uniform vec2 tex2Resolution;

uniform sampler2D texFilter;
uniform vec2 texFilterResolution;

const float scale = 1.0;
const float maxDelay = 0.5;
const float duration = 1.0 - maxDelay;
const float timeRate = 0.001;
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
  float sinTime = sin(uTime * timeRate);
  vec2 uv = vec2(gl_FragCoord.xy / uResolution.xy);
  float delay = min(uv.x, 0.5);
  float progress = (clamp(((sinTime + 1.0) * 0.5) - delay * maxDelay, 0.0, duration) / duration);
  float revProgress = 1.0 - progress;
  float currentScale = pow(cos(PI * sinTime / 2.0), 3.5);
  float noise = snoise(vec3(uv, uTime * 0.0003));
  vec2 tex1Pix = imageUv(uResolution, tex1Resolution, uv) * 2.0 - 1.0;
  vec2 tex2Pix = imageUv(uResolution, tex2Resolution, uv) * 2.0 - 1.0;


  // float rateH = min(
  //   (uResolution.y / uResolution.x) / (tex2Resolution.y / tex2Resolution.x),
  //   1.0
  // );
  // float rateR = uResolution.y / uResolution.x;
  // // vec3 normal = abs(normalize(vNormal));
  // // float light = dot(normal, uLightDirection);
  vec2 p = (gl_FragCoord.xy / min(uResolution.x, uResolution.y)) * 2.0 - 1.0;

  vec4 filterColor = texture2D(texFilter, uv * (noise + 1.0) / 2.0);
  float filterAvg = (((filterColor.x + filterColor.y + filterColor.z) / 3.0) * 2.0 - 1.0);

  vec4 tex1Color = texture2D(
    tex1,
    ((vec2(tex1Pix.x, - tex1Pix.y) * currentScale + 1.0) / 2.0) + (filterAvg * progress)
  );
  vec4 tex2Color = texture2D(
    tex2,
    ((vec2(tex2Pix.x, - tex2Pix.y) * currentScale + 1.0) / 2.0) + (filterAvg * revProgress)
  );

  gl_FragColor = mix(tex1Color, tex2Color, progress);
}
