
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

mat3 rotateQ (vec3 axis, float rad) {
  float hr = rad / 2.0;
  float s = sin( hr );
  vec4 q = vec4(axis * s, cos( hr ));
  vec3 q2 = q.xyz + q.xyz;
  vec3 qq2 = q.xyz * q2;
  vec2 qx = q.xx * q2.yz;
  float qy = q.y * q2.z;
  vec3 qw = q.w * q2.xyz;

  return mat3(
    1.0 - (qq2.y + qq2.z),  qx.x - qw.z,            qx.y + qw.y,
    qx.x + qw.z,            1.0 - (qq2.x + qq2.z),  qy - qw.x,
    qx.y - qw.y,            qy + qw.x,              1.0 - (qq2.x + qq2.y)
  );
}