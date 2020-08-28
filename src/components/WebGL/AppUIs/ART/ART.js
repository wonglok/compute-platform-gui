import { BufferGeometry, Mesh, BufferAttribute, Object3D } from "three"
import { ShaderMaterial, DoubleSide, Vector3 } from "three/build/three.module"
import * as ArtCoder from '../ARTBlockers/art-coder.js'
let glsl = (strings, ...args) => {
  let res = ''

  strings.forEach((s, i) => {
    res += s + (args[i] || '')
  })
  res = res.split('\n').map(e => {
    return e.replace('        ', '')
  }).join('\n')

  return res
}

export class ART {
  constructor ({ renderer, onLoop, onClean }) {
    this.renderer = renderer
    this.onClean = onClean
    this.onLoop = onLoop
    this.o3d = new Object3D()
    this.out = {
      o3d: this.o3d
    }

    this.config = this.getDefaultConfig()
  }
  getNewAttr () {
    return {
      needsUpdate: true,
      count: 4,
      type: 'vec4',
      name: 'specialSpeed_' + (Math.random() * 100).toFixed(0),
      isDynamic: false,
      terser: `
// 'x', 'y', 'z', 'dimension', 'totalPoints', 'pointID', 'vertexID', 'totalVetex', 'out'

out.x = x - dimension * 0.5;
out.y = y - dimension * 0.5;
out.z = z - dimension * 0.5;

out.w = 1;`
    }
  }
  getNewUniform () {
    return {
      name: 'motion_' + (Math.random() * 100).toFixed(0),
      type: 'float',
      updater: 'slider',
      value: 0
    }
  }
  getBlockers () {
    return {
      type: 'blockers',
      id: Math.random() + '',
      vertexCode: '',
      fragmentCode: '',
      blockers: ArtCoder.makeDemo1()
    }
  }
  getDefaultConfig () {
    return {
      WIDTH: 48,
      blockers: this.getBlockers(),
      extraAttrs: [
        {
          needsUpdate: true,
          count: 4,
          type: 'vec4',
          name: 'specialColor',
          isDynamic: false,
          terser: `
//'x', 'y', 'z', 'dimension', 'totalPoints', 'pointID', 'vertexID', 'totalVetex', 'out'

out.x = x - dimension * 0.5;
out.y = y - dimension * 0.5;
out.z = z - dimension * 0.5;

out.w = 1;`
        }
      ],
      extraUniforms: [
        {
          name: 'mic',
          type: 'sampler2D',
          updater: 'mic',
          needsAuhtorises: true,
          value: null
        }
        // {
        //   name: 'speed',
        //   type: 'float',
        //   updater: 'slider',
        //   value: 0
        // },
        // {
        //   name: 'color',
        //   type: 'vec3',
        //   updater: 'picker',
        //   value: {
        //     x: 0, y: 0, z: 0
        //   }
        // }
      ],

      vertexBlockersCode: ``,
      fragmentBlockersCode: ``,
      varyingsStr: glsl`varying highp vec3 vPos;
varying vec2 vUv;`,
      vertexMain: glsl`
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

          vec4 sound = texture2D(mic, uv);

          if (!isInvalid) {
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
      `,
      fragmentMain: glsl`
        void main (void) {
          vec4 sound = texture2D(mic, vUv);
          vec3 v_tt = normalize(vPos);
          vec4 dataOutput = vec4(
            sound.r + 0.25 + abs(v_tt.x),
            sound.r + 0.75 + abs(v_tt.y),
            sound.r + 0.25 + abs(v_tt.z),
            0.8
          );
          vec4 defaultColor = dataOutput;

          /* INSERT_BLOCKERS */

          gl_FragColor = dataOutput;
        }
      `
    }
  }
  set config (v) {
    this._config = v
    this.refresh(v)
  }
  get config () {
    return this._config
  }
  refresh (config) {
    this.lastWidth = this.width
    this.width = config.WIDTH

    if (!this.geo || this.lastWidth !== this.width) {
      let geo = new BufferGeometry()
      geo.setAttribute('position', new BufferAttribute(this.makePos(), 3))
      geo.setAttribute('meta', new BufferAttribute(this.makeMeta(), 4))
      geo.setAttribute('uv', new BufferAttribute(this.makeMetaUV(), 2))
      this.geo = geo
    }

    config.extraAttrs.filter(e => e.needsUpdate || this.lastWidth !== this.width).forEach((attr) => {
      this.geo.setAttribute(attr.name, new BufferAttribute(this.makeTerser({ attr }), attr.count))
      attr.needsUpdate = false
    })

    let attrsStr = ''
    config.extraAttrs.forEach(attr => {
      attrsStr += `
        attribute ${attr.precision || ''} ${attr.type} ${attr.name};
      `
    })

    var uniforms = {
      time: { value: 0 }
    }

    let uniformStr = ``
    config.extraUniforms.forEach(uniform => {
      uniformStr += `
        uniform ${uniform.type} ${uniform.name};
      `
      uniforms[uniform.name] = { value: uniform.value }
    })
    this.uniformSignLast = this.uniformSign
    this.uniformSign = Object.keys(uniforms).join('-')

    let UVSize = Math.pow(config.WIDTH * config.WIDTH * config.WIDTH, 0.5).toFixed(1)

    let vertexShader = glsl`
      #define RESOLUTION vec2(${UVSize}, ${UVSize})
      uniform float time;
      attribute vec4 meta;

      ${attrsStr}
      ${uniformStr}
      ${config.varyingsStr}

      ${config.vertexMain}
    `

    let fragmentShader = glsl`
      #define RESOLUTION vec2(${UVSize}, ${UVSize})
      uniform float time;
      ${uniformStr}
      ${config.varyingsStr}


      ${config.fragmentMain}
    `

    let blockersToken = `/* INSERT_BLOCKERS */`
    vertexShader = vertexShader.replace(blockersToken, config.blockers.vertexCode)
    fragmentShader = fragmentShader.replace(blockersToken, config.blockers.fragmentCode)

    this.mat = new ShaderMaterial({
      uniforms,
      side: DoubleSide,
      transparent: true,
      vertexShader,
      fragmentShader
    })
    if (this.mesh) {
      this.mesh.material = this.mat
    }

    if (!this.mesh || this.geo !== this.mesh.geometry) {
      this.mesh = new Mesh(this.geo, this.mat)
    }

    this.onLoop(() => {
      uniforms.time.value = window.performance.now() * 0.001

      config.extraUniforms.forEach(uniform => {
        uniforms[uniform.name] = { value: uniform.value }
      })
    })

    this.out.o3d.children.forEach(sub => {
      this.out.o3d.remove(sub)
    })

    this.out.o3d.add(this.mesh)
  }
  makeTerser ({ attr }) {
    let ARR_VALUE = []
    let WIDTH = this.width
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH * WIDTH, 1 / 3))
    let total = dimension * dimension * dimension
    let iii = 0

    let fnCall = new Function('x', 'y', 'z', 'dimension', 'totalPoints', 'pointID', 'vertexID', 'totalVetex', 'out', attr.terser)

    var out = {
      x: 0,
      y: 0,
      z: 0,
      w: 0
    }
    for (var ix = 0; ix < dimension; ix++) {
      for (var iy = 0; iy < dimension; iy++) {
        for (var iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          let id = iii / attr.count

          fnCall(ix, iy, iz, dimension, total, id, iii, total * attr.count, out)

          if (attr.count >= 1) {
            ARR_VALUE[iii + 0] = out.x // square vertex ID
          }
          if (attr.count >= 2) {
            ARR_VALUE[iii + 1] = out.y // square ID
          }
          if (attr.count >= 3) {
            ARR_VALUE[iii + 2] = out.z // percentage
          }
          if (attr.count >= 4) {
            ARR_VALUE[iii + 3] = out.w // point ID
          }

          iii += attr.count
        }
      }
    }
    return new Float32Array(ARR_VALUE)
  }
  makeMeta () {
    let ARR_VALUE = []
    let WIDTH = this.width
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH * WIDTH, 1 / 3))
    let total = dimension * dimension * dimension
    let iii = 0
    for (var ix = 0; ix < dimension; ix++) {
      for (var iy = 0; iy < dimension; iy++) {
        for (var iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          let id = iii / 4

          ARR_VALUE[iii + 0] = id % 6 // square vertex ID
          ARR_VALUE[iii + 1] = Math.floor(id / 6) // square ID
          ARR_VALUE[iii + 2] = total / 6.0 // percentage

          // dot id
          ARR_VALUE[iii + 3] = id // point ID

          iii += 4
        }
      }
    }
    return new Float32Array(ARR_VALUE)
  }
  makeMetaUV () {
    /*
    float dimension = (pow(totalSquares, 1.0 / 2.0));

    float dX = mod(abs(squareIDX / pow(dimension, 0.0)), dimension) - dimension * 0.5;
    float dY = mod(abs(squareIDX / pow(dimension, 1.0)), dimension) - dimension * 0.5;
    */
    let mod = (a, b) => {
      return a % b
    }

    let ARR_VALUE = []
    let WIDTH = this.width
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH * WIDTH, 1 / 3))
    let total = dimension * dimension * dimension
    let iii = 0

    let totalSquares = total / 6.0
    let dimens = (Math.pow(totalSquares, 1.0 / 2.0));
    for (var ix = 0; ix < dimension; ix++) {
      for (var iy = 0; iy < dimension; iy++) {
        for (var iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          let id = iii / 2

          let squareIDX = Math.floor(id / 6)

          let dU = mod(Math.abs(squareIDX / Math.pow(dimens, 0.0)), dimens) / dimens;
          let dV = mod(Math.abs(squareIDX / Math.pow(dimens, 1.0)), dimens) / dimens;

          ARR_VALUE[iii + 0] = dU // square vertex ID
          ARR_VALUE[iii + 1] = dV // square ID

          iii += 2
        }
      }
    }
    return new Float32Array(ARR_VALUE)
  }
  makePos () {
    let ARR_VALUE = []
    let WIDTH = this.width
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH * WIDTH, 1 / 3))
    // let total = WIDTH * WIDTH
    let iii = 0
    for (var ix = 0; ix < dimension; ix++) {
      for (var iy = 0; iy < dimension; iy++) {
        for (var iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          // let id = iii / 4

          ARR_VALUE[iii + 0] = 0 // square vertex ID
          ARR_VALUE[iii + 1] = 0 // square ID
          ARR_VALUE[iii + 2] = 0 // percentage

          iii += 3
        }
      }
    }
    return new Float32Array(ARR_VALUE)
  }
}
