/*
  LIBRARY
*/
#include <common>

void main (void) {
  vec4 sound = texture2D(mic, vUv);
  vec3 v_tt = normalize(vPos);

  vec4 dataOutput = vec4(
    sound.r * 0.25 + abs(v_tt.x),
    sound.r * 0.75 + abs(v_tt.y),
    sound.r * 0.25 + abs(v_tt.z),
    0.8
  );
  // dataOutput = vec4(0.5, 0.5, 0.5, 1.0);
  vec4 defaultColor = dataOutput;

  /* INSERT_REMIX_CODE */

  gl_FragColor = dataOutput;
}