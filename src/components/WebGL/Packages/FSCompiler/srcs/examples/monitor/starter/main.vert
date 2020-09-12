/*
  LIBRARY
*/
#include <common>


void main (void) {
  vUv = uv;

  float vertexIDX = meta.x;
  float unitIDX = meta.y;
  float totalUnits = meta.z;
  float pointIDX = meta.w;
  vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);

  /*
    Assemble
  */

  vec3 plane = vec3(1.0, 1.0, 0.0);
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

  float uvDimension = ceil(pow(totalUnits, 0.5));
  vUv.x = (unitIDX / uvDimension) / uvDimension;
  vUv.y = (mod(unitIDX, uvDimension)) / uvDimension;
  vec4 historySound = texture2D(mic, vUv);
  vec4 currentSound = texture2D(micNow, vUv);

  float dimension3D = (pow(totalUnits, 1.0 / 3.0));

  float d3X = mod(abs(unitIDX / pow(dimension3D, 0.0)), dimension3D) - dimension3D * 0.5;
  float d3Y = mod(abs(unitIDX / pow(dimension3D, 1.0)), dimension3D) - dimension3D * 0.5;
  float d3Z = mod(abs(unitIDX / pow(dimension3D, 2.0)), dimension3D) - dimension3D * 0.5;

  float dimension2D = ceil(pow(totalUnits, 0.5));
  float d2X = (unitIDX / dimension2D) * 2.0 - dimension2D;
  float d2Y = (mod(unitIDX, dimension2D)) * 2.0 - dimension2D;

  float gapper = 1.5;

  pos.x *= 0.1;
  pos.y *= 0.1;

  pos.x += d3X * gapper;
  pos.y += d3Y * gapper;
  pos.z += d3Z * gapper;

  pos.xyz *= 2.0;

  // float r1 = rand(vec2(d3X)) - 0.5;
  // float r2 = rand(vec2(d3Y)) - 0.5;
  // float r3 = rand(vec2(d3Z)) - 0.5;
  // pos += vec4(vec3(r1, r2, r3) * 30.0, 0.0);

  // float az = 0.0;
  // float el = 0.0;
  // toBall(pos.xyz, az, el);
  // pos.xyz = fromBall(50.0 + historySound.r * 22.8, az, el);

  // float pX = pos.x;
  // float pY = pos.y;
  // float pZ = pos.z;
  // float piz = 0.005 * 2.0 * 3.14159265;

  // pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;

  vec4 starterPosition = pos;
  vec4 finalPosition = pos;

  /* INSERT_REMIX_CODE */

  if (isInvalid) {
    pos.xyzw = vec4(0.0);
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition);
  vPos = pos.xyz;
}
