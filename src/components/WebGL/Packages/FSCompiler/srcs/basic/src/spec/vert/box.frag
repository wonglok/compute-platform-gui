varying vec3 v_pos;

void main (void) {
  gl_FragColor = vec4(normalize(v_pos.xyz) + 0.3, 1.0);
}
