uniform float time;
varying vec3 v_pos;
void main(void) {
  vec3 nPos = position;
  nPos.x += sin(nPos.y * 0.1 + time * 10.0) * 10.0;

  v_pos = vec3(nPos.x, nPos.y, nPos.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}
