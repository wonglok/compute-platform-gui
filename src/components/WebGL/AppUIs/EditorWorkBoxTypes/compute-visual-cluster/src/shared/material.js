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


class MetaGeometry {
  constructor ({ width, THREE }) {
    this.width = width
    // let geo = new THREE.BufferGeometry()

    // geo.setAttribute('position', new THREE.BufferAttribute(this.makePos(), 3))
    // geo.setAttribute('uv', new THREE.BufferAttribute(this.makeMetaUV(), 2))
    // geo.setAttribute('meta', new THREE.BufferAttribute(this.makeMeta(), 4))
    let { BufferGeometry, BufferAttribute } = THREE
    let geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(this.makePos(), 3))
    geo.setAttribute('meta', new BufferAttribute(this.makeMeta(), 4))
    // geo.setAttribute('uv', new BufferAttribute(this.makeMetaUV(), 2))

    return geo
  }
  // makeMeta () {
  //   let ARR_VALUE = []
  //   let WIDTH = this.width
  //   let dimension = Math.floor(Math.pow(WIDTH * WIDTH * WIDTH, 1 / 3))
  //   let total = dimension * dimension * dimension
  //   let iii = 0
  //   for (var ix = 0; ix < dimension; ix++) {
  //     for (var iy = 0; iy < dimension; iy++) {
  //       for (var iz = 0; iz < dimension; iz++) {
  //         // console.log(iii)
  //         let id = iii / 4

  //         ARR_VALUE[iii + 0] = id % 6 // square vertex ID
  //         ARR_VALUE[iii + 1] = Math.floor(id / 6) // square ID
  //         ARR_VALUE[iii + 2] = total / 6.0 // percentage

  //         // dot id
  //         ARR_VALUE[iii + 3] = id // point ID

  //         iii += 4
  //       }
  //     }
  //   }
  //   return new Float32Array(ARR_VALUE)
  // }
  // makeMetaUV () {
  //   /*
  //   float dimension = (pow(totalSquares, 1.0 / 2.0));

  //   float dX = mod(abs(squareIDX / pow(dimension, 0.0)), dimension) - dimension * 0.5;
  //   float dY = mod(abs(squareIDX / pow(dimension, 1.0)), dimension) - dimension * 0.5;
  //   */
  //   let mod = (a, b) => {
  //     return a % b
  //   }

  //   let ARR_VALUE = []
  //   let WIDTH = this.width
  //   let dimension = Math.floor(Math.pow(WIDTH * WIDTH * WIDTH, 1 / 3))
  //   let total = dimension * dimension * dimension
  //   let iii = 0

  //   let totalSquares = total / 6.0
  //   let dimens = (Math.pow(totalSquares, 1.0 / 2.0));
  //   for (var ix = 0; ix < dimension; ix++) {
  //     for (var iy = 0; iy < dimension; iy++) {
  //       for (var iz = 0; iz < dimension; iz++) {
  //         // console.log(iii)
  //         let id = iii / 2

  //         let squareIDX = Math.floor(id / 6)

  //         let dU = mod(Math.abs(squareIDX / Math.pow(dimens, 0.0)), dimens) / dimens;
  //         let dV = mod(Math.abs(squareIDX / Math.pow(dimens, 1.0)), dimens) / dimens;

  //         ARR_VALUE[iii + 0] = dU // square vertex ID
  //         ARR_VALUE[iii + 1] = dV // square ID

  //         iii += 2
  //       }
  //     }
  //   }
  //   return new Float32Array(ARR_VALUE)
  // }
  // makePos () {
  //   let ARR_VALUE = []
  //   let WIDTH = this.width
  //   let dimension = Math.floor(Math.pow(WIDTH * WIDTH * WIDTH, 1 / 3))
  //   // let total = WIDTH * WIDTH
  //   let iii = 0
  //   for (var ix = 0; ix < dimension; ix++) {
  //     for (var iy = 0; iy < dimension; iy++) {
  //       for (var iz = 0; iz < dimension; iz++) {
  //         // console.log(iii)
  //         // let id = iii / 4

  //         ARR_VALUE[iii + 0] = 0 // square vertex ID
  //         ARR_VALUE[iii + 1] = 0 // square ID
  //         ARR_VALUE[iii + 2] = 0 // percentage

  //         iii += 3
  //       }
  //     }
  //   }
  //   return new Float32Array(ARR_VALUE)
  // }

  // makeMetaUV () {
  //   /*
  //   float dimension = (pow(totalSquares, 1.0 / 2.0));

  //   float dX = mod(abs(squareIDX / pow(dimension, 0.0)), dimension) - dimension * 0.5;
  //   float dY = mod(abs(squareIDX / pow(dimension, 1.0)), dimension) - dimension * 0.5;
  //   */
  //   let mod = (a, b) => {
  //     return a % b
  //   }

  //   let ARR_VALUE = []
  //   let WIDTH = this.width
  //   let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3))
  //   let total = dimension * dimension * dimension
  //   let iii = 0

  //   let totalSquares = total / 6.0
  //   let dimens = (Math.pow(totalSquares, 1.0 / 2.0));
  //   for (var ix = 0; ix < dimension; ix++) {
  //     for (var iy = 0; iy < dimension; iy++) {
  //       for (var iz = 0; iz < dimension; iz++) {
  //         // console.log(iii)
  //         let id = iii / 2

  //         let squareIDX = Math.floor(id / 6)

  //         let dU = mod(Math.abs(squareIDX / Math.pow(dimens, 0.0)), dimens) / dimens;
  //         let dV = mod(Math.abs(squareIDX / Math.pow(dimens, 1.0)), dimens) / dimens;

  //         ARR_VALUE[iii + 0] = dU // square vertex ID
  //         ARR_VALUE[iii + 1] = dV // square ID

  //         iii += 2
  //       }
  //     }
  //   }
  //   return new Float32Array(ARR_VALUE)
  // }

  makeMeta () {
    let ARR_VALUE = []
    let WIDTH = this.width
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3))
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
  makePos () {
    let ARR_VALUE = []
    let WIDTH = this.width
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3))
    // let total = WIDTH * WIDTH
    let iii = 0
    for (var ix = 0; ix < dimension; ix++) {
      for (var iy = 0; iy < dimension; iy++) {
        for (var iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          // let id = iii / 4

          ARR_VALUE[iii + 0] = 0
          ARR_VALUE[iii + 1] = 0
          ARR_VALUE[iii + 2] = 0

          iii += 3
        }
      }
    }
    return new Float32Array(ARR_VALUE)
  }
}

export class MetaShieldMaterial {
  constructor ({ onLoop, THREE, gui }) {
    this.onLoop = onLoop
    var uniforms = {
      vertexTexture: { value: null },
      colorTexture: { value: null },
      time: { value: 0 }
    }

    this.shader = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      transparent: true,
      vertexShader: MetaShieldMaterial.vertexShader({ gui }),
      fragmentShader: MetaShieldMaterial.fragmentShader({ gui })
    })

    this.onLoop(() => {
      uniforms.time.value = window.performance.now() * 0.001
    })

    return this.shader
  }
  static vertexShader ({ gui }) {
    return glsl`
      uniform float time;
      attribute vec4 meta;
      varying highp vec3 vPos;
      varying highp vec2 vUv;
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

      ${gui.compute}

      void main (void) {
        vec4 data = compute();
        gl_Position = projectionMatrix * modelViewMatrix * data;
        vPos = data.xyz;

        float vertexIDX = meta.x;
        float squareIDX = meta.y;
        float totalSquares = meta.z;
        float pointIDX = meta.w;

        float dimension2D = ceil(pow(totalSquares, 0.5));
        float d2X = (squareIDX / dimension2D) * 2.0 - dimension2D;
        float d2Y = (mod(squareIDX, dimension2D)) * 2.0 - dimension2D;

        vUv.x = (squareIDX / dimension2D) / dimension2D;
        vUv.y = (mod(squareIDX, dimension2D)) / dimension2D;
      }
    `
  }

  static fragmentShader ({ gui }) {
    return glsl`
    varying highp vec3 vPos;
    varying highp vec2 vUv;
    uniform sampler2D colorTexture;
      void main (void) {
        vec4 textureColor = texture2D(colorTexture, vUv);
        if (length(textureColor.rgb) > 0.0) {
          gl_FragColor = textureColor;
        } else {
          vec3 v_tt = normalize(vPos);
          gl_FragColor = vec4(
            0.25 + abs(v_tt.x),
            0.75 + abs(v_tt.y),
            0.25 + abs(v_tt.z),
            0.6
          );
        }
      }
    `
  }
}

export class ComputeGeo {
  constructor ({ box, work }) {
    this.work = work
    this.box = box
    this.THREE = box.deps.THREE

    let gui = work.guiData

    this.shieldGeo = new MetaGeometry({ box, gui, width: gui.sizeX, THREE: this.THREE })
    this.shieldMat = new MetaShieldMaterial({ box, gui, onLoop: box.onLoop, THREE: this.THREE })

    this.shield = new this.THREE.Mesh(this.shieldGeo, this.shieldMat)

    let signatureSize = ''
    let signSize = () => {
      return JSON.stringify([
        gui.sizeX
      ])
    }
    box.onRefresh(() => {
      let newSig = signSize()
      if (signatureSize !== newSig) {
        signatureSize = newSig
        this.shieldGeo = new MetaGeometry({ box, gui, width: gui.sizeX, THREE: this.THREE })
        this.shield.geometry = this.shieldGeo
        this.shield.needsUpdate = true
      }
    })

    let signatureCompute = ''
    let signCompute = () => {
      return JSON.stringify([
        gui.compute
      ])
    }
    box.onRefresh(() => {
      let newSig = signCompute()
      if (signatureCompute !== newSig) {
        signatureCompute = newSig
        this.shieldMat = new MetaShieldMaterial({ box, gui, onLoop: box.onLoop, THREE: this.THREE })
        this.shield.material = this.shieldMat
        this.shield.needsUpdate = true
      }
    })

    box.scene.add(this.shield)
    box.camera.position.z = 100

    this.setColorTexture = ({ texture }) => {
      this.shield.material.uniforms.colorTexture.value = texture
    }

    this.setVertexTexture = ({ texture }) => {
      this.shield.material.uniforms.vertexTexture.value = texture
    }
  }
}