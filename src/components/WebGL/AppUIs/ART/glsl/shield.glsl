/*
          LIBRARY
        */
        #include <common>

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

        /*
          LIBRARY
        */

        /* BALLIFY */
        #define M_PI 3.1415926535897932384626433832795
        float atan2(in float y, in float x) {
          bool xgty = (abs(x) > abs(y));
          return mix(M_PI/2.0 - atan(x,y), atan(y,x), float(xgty));
        }
        vec3 fromBall(float r, float az, float el) {
          return vec3(
            r * cos(el) * cos(az),
            r * cos(el) * sin(az),
            r * sin(el)
          );
        }
        void toBall(vec3 pos, out float az, out float el) {
          az = atan2(pos.y, pos.x);
          el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
        }
        // float az = 0.0;
        // float el = 0.0;
        // vec3 noiser = vec3(lastVel);
        // toBall(noiser, az, el);
        // lastVel.xyz = fromBall(1.0, az, el);

        vec3 ballify (vec3 pos, float r) {
          float az = atan2(pos.y, pos.x);
          float el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
          return vec3(
            r * cos(el) * cos(az),
            r * cos(el) * sin(az),
            r * sin(el)
          );
        }
        /* BALLIFY */

        void main (void) {
          vUv = uv;

          float vertexIDX = meta.x;
          float squareIDX = meta.y;
          float totalSquares = meta.z;
          float pointIDX = meta.w;
          vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);

          /*
            Assemble
          */
          vec3 plane = vec3(0.14, 0.14, 0.0);
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


          if (!isInvalid) {
            float uvDimension = ceil(pow(totalSquares, 0.5));
            vUv.x = (squareIDX / uvDimension) / uvDimension;
            vUv.y = (mod(squareIDX, uvDimension)) / uvDimension;
            vec4 sound = texture2D(mic, uv);

            float dimension = (pow(totalSquares, 1.0 / 3.0));

            float dX = mod(abs(squareIDX / pow(dimension, 0.0)), dimension) - dimension * 0.5;
            float dY = mod(abs(squareIDX / pow(dimension, 1.0)), dimension) - dimension * 0.5;
            float dZ = mod(abs(squareIDX / pow(dimension, 2.0)), dimension) - dimension * 0.5;

            float gapper = 1.23;

            pos.x += dX * gapper;
            pos.y += dY * gapper;
            pos.z += dZ * gapper;

            pos.xyz *= 10.0;

            float r1 = rand(vec2(dX)) - 0.5;
            float r2 = rand(vec2(dY)) - 0.5;
            float r3 = rand(vec2(dZ)) - 0.5;
            pos += vec4(vec3(r1, r2, r3) * 30.0, 0.0);

            float az = 0.0;
            float el = 0.0;
            toBall(pos.xyz, az, el);
            pos.xyz = fromBall(50.0 + sound.r * 22.8, az, el);

            float pX = pos.x;
            float pY = pos.y;
            float pZ = pos.z;
            float piz = 0.005 * 2.0 * 3.14159265;

            pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;
          }

          // if (squareIDX > 1024.0 * 14.5 && mod(squareIDX, 6.0) != 0.0) {
          //   pos = vec4(0.0);
          // }

          vec4 dataOutput = pos;
          vec4 defaultPosition = pos;

          /* INSERT_BLOCKERS */

          gl_Position = projectionMatrix * modelViewMatrix * vec4(dataOutput);
          vPos = pos.xyz;
        }