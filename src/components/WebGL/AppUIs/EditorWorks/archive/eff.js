const examples = [
  {
    _id: getID(),
    name: 'plane',
    code: glsl`
vec4 compute () {
  //  ------- setup code -------
  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float pointIDX = meta.w;
  vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);

  vec3 plane = vec3(1.0, 1.0, 1.0);
  bool isInvalid = false;

  if (vertexIDX == 0.0) {
    pos.x = 1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 1.0) {
    pos.x = -1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 2.0) {
    pos.x = -1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 3.0) {
    pos.x = 1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 4.0) {
    pos.x = -1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 5.0) {
    pos.x = 1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else {
    isInvalid = true;
  }

  // cube
  float dimension3D = floor(pow(totalSquares, 1.0 / 3.0));
  float dX3D = mod(abs(squareIDX / pow(dimension3D, 0.0)), dimension3D) - dimension3D * 0.5;
  float dY3D = mod(abs(squareIDX / pow(dimension3D, 1.0)), dimension3D) - dimension3D * 0.5;
  float dZ3D = mod(abs(squareIDX / pow(dimension3D, 2.0)), dimension3D) - dimension3D * 0.5;

  // planes
  float dimension2D = floor(pow(totalSquares, 0.5));
  float dX2D = (squareIDX / dimension2D) * 2.0 - dimension2D;
  float dY2D = (mod(squareIDX, dimension2D)) * 2.0 - dimension2D;

  // UV for planes & cube
  vec2 textureUV = vec2(
    (squareIDX / dimension2D) / dimension2D,
    (mod(squareIDX, dimension2D)) / dimension2D
  );

  vUv = textureUV.xy;

  vec4 vertexData = texture2D(vertexTexture, vec2(
    textureUV.x,
    textureUV.y
  ));

  bool hasVertexData = (length(vertexData.xyz) > 0.0 || vertexData.a > 0.0);

  // ---------- Graphics Code ----------

  float extraRadius = 1.0;
  if (hasVertexData) {
    extraRadius = 0.1 + (vertexData.r);
  }

  float gapper = 0.6;

  pos.x *= 0.5 * extraRadius;
  pos.y *= 0.5 * extraRadius;
  pos.z *= 0.0;

  pos.x += dX2D * gapper;
  pos.y += dY2D * gapper;

  float pX = pos.x;
  float pY = pos.y;
  float pZ = pos.z;
  float piz = 0.005 * 2.0 * 3.14159265;

  pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateZ(time + pY * piz) * pos.xyz;
  pos.xyz = rotateQ(normalize(vec3(1.0, pX * piz, 1.0)), time + pX * piz) * rotateX(time + pY * piz) * pos.xyz;

  pos.w = 1.0;

  if (isInvalid) {
    pos = vec4(0.0);
  }

  return pos;
}

      `,
  },
  {
    _id: getID(),
    name: 'cluster',
    code: glsl`
vec4 compute () {
  //  ------- setup code -------
  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float pointIDX = meta.w;
  vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);

  vec3 plane = vec3(1.0, 1.0, 1.0);
  bool isInvalid = false;

  if (vertexIDX == 0.0) {
    pos.x = 1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 1.0) {
    pos.x = -1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 2.0) {
    pos.x = -1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 3.0) {
    pos.x = 1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 4.0) {
    pos.x = -1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 5.0) {
    pos.x = 1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else {
    isInvalid = true;
  }

  // Cube
  float dimension3D = floor(pow(totalSquares, 1.0 / 3.0));
  float dX3D = mod(abs(squareIDX / pow(dimension3D, 0.0)), dimension3D) - dimension3D * 0.5;
  float dY3D = mod(abs(squareIDX / pow(dimension3D, 1.0)), dimension3D) - dimension3D * 0.5;
  float dZ3D = mod(abs(squareIDX / pow(dimension3D, 2.0)), dimension3D) - dimension3D * 0.5;

  // Planes
  float dimension2D = floor(pow(totalSquares, 0.5));
  float dX2D = (squareIDX / dimension2D) * 2.0 - dimension2D;
  float dY2D = (mod(squareIDX, dimension2D)) * 2.0 - dimension2D;

  // UV for Planes & Cube
  vec2 textureUV = vec2(
    (squareIDX / dimension2D) / dimension2D,
    (mod(squareIDX, dimension2D)) / dimension2D
  );

  vUv = textureUV.xy;

  vec4 vertexData = texture2D(vertexTexture, vec2(
    textureUV.x,
    textureUV.y
  ));

  bool hasVertexData = (length(vertexData.xyz) > 0.0 || vertexData.a > 0.0);

  // ---------- Graphics Code ----------

  float extraRadius = 0.0;
  if (hasVertexData) {
    extraRadius += 20.0 * vertexData.r;
  }

  float gapper = 1.0;

  pos.x *= 0.15;
  pos.y *= 0.15;
  pos.z *= 0.0;

  pos.x += dX3D * gapper;
  pos.y += dY3D * gapper;
  pos.z += dZ3D * gapper;

  pos.xy *= 0.45;

  float r1 = rand(vec2(dX3D)) - 0.5;
  float r2 = rand(vec2(dY3D)) - 0.5;
  float r3 = rand(vec2(dZ3D)) - 0.5;
  pos += 0.3 * vec4(vec3(r1, r2, r3), 0.0);

  float az = 0.0;
  float el = 0.0;
  toBall(pos.xyz, az, el);

  pos.xyz = fromBall(50.0 + extraRadius, az, el);

  float pX = pos.x;
  float pY = pos.y;
  float pZ = pos.z;
  float piz = 0.005 * 2.0 * 3.14159265;

  pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;

  pos.w = 1.0;

  if (isInvalid) {
    pos = vec4(0.0);
  }

  return pos;
}

    `
  }
]
