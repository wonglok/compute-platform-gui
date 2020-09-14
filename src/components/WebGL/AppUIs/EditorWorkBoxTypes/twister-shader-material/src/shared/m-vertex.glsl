uniform float pointSize;
uniform float time;
varying vec2 vUv;
uniform float twisterX;
uniform float twisterY;
uniform float twisterZ;
uniform float twisterSpeedX;
uniform float twisterSpeedY;
uniform float twisterSpeedZ;

mat3 rotateX (float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, s,
    0.0, -s, c
  );
}

mat3 rotateY (float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

mat3 rotateZ (float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
    c, s, 0.0,
    -s, c, 0.0,
    0.0, 0.0, 1.0
  );
}


void main(void) {
  vec3 nPos = position;

  // nPos.x += sin(nPos.y * 0.1 + time * 10.0) * 10.0;

  nPos.xyz *= rotateX(nPos.x * 0.02 * 3.14159265 * 2.0 * twisterX + sin(time * twisterSpeedX));
  nPos.xyz *= rotateY(nPos.y * 0.02 * 3.14159265 * 2.0 * twisterY + sin(time * twisterSpeedY));
  nPos.xyz *= rotateZ(nPos.z * 0.02 * 3.14159265 * 2.0 * twisterZ + sin(time * twisterSpeedZ));

  nPos.xyz += normalize(nPos.xyz) * sin(nPos.x * twisterX);
  nPos.xyz += normalize(nPos.xyz) * sin(nPos.y * twisterY);
  nPos.xyz += normalize(nPos.xyz) * sin(nPos.z * twisterZ);

  vUv = uv;
  gl_PointSize = pointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}