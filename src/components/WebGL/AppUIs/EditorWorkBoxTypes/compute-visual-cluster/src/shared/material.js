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

    let { BufferGeometry, BufferAttribute } = THREE
    let geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(this.makePos(), 3))
    // geo.setAttribute('meta', new BufferAttribute(this.makeMeta(), 4))
    geo.setAttribute('uv', new BufferAttribute(this.makeMetaUV(), 2))

    return geo
  }

  // makeMeta () {
  //   let ARR_VALUE = []
  //   let WIDTH = this.width
  //   let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3))
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

  makeMetaUV () {
    let ARR_VALUE = []
    let dimension = this.width
    let iii = 0
    for (var iy = 0; iy < dimension; iy++) {
      for (var ix = 0; ix < dimension; ix++) {
        // console.log(iii)
        let id = iii / 2

        ARR_VALUE[iii + 0] = ix / dimension
        ARR_VALUE[iii + 1] = iy / dimension

        iii += 2
      }
    }
    return new Float32Array(ARR_VALUE)
  }

  makePos () {
    let ARR_VALUE = []
    let WIDTH = this.width
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3))
    let total = WIDTH * WIDTH
    let iii = 0
    let pos = { x: 0, y: 0, z: 0 }
    let plane = { x: 1, y: 1, z: 1 }
    let floor = Math.floor
    let pow = Math.pow
    let mod = (v, a) => v % a
    for (var ix = 0; ix < dimension; ix++) {
      for (var iy = 0; iy < dimension; iy++) {
        for (var iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          let id = iii / 3

          let squareVertexID = id % 6;
          let squareIDX = Math.floor(id / 6);
          let totalSquares = total / 6.0

          // let cx3 = (ix - dimension * 0.5) / dimension;
          // let cy3 = (iy - dimension * 0.5) / dimension;
          // let cz3 = (iz - dimension * 0.5) / dimension;

          if (squareVertexID == 0.0) {
            pos.x = 1.0 * plane.x;
            pos.y = 1.0 * plane.y;
            pos.z = 1.0 * plane.z;
          } else if (squareVertexID == 1.0) {
            pos.x = -1.0 * plane.x;
            pos.y = 1.0 * plane.y;
            pos.z = 1.0 * plane.z;
          } else if (squareVertexID == 2.0) {
            pos.x = -1.0 * plane.x;
            pos.y = -1.0 * plane.y;
            pos.z = 1.0 * plane.z;
          } else if (squareVertexID == 3.0) {
            pos.x = 1.0 * plane.x;
            pos.y = 1.0 * plane.y;
            pos.z = 1.0 * plane.z;
          } else if (squareVertexID == 4.0) {
            pos.x = -1.0 * plane.x;
            pos.y = -1.0 * plane.y;
            pos.z = 1.0 * plane.z;
          } else if (squareVertexID == 5.0) {
            pos.x = 1.0 * plane.x;
            pos.y = -1.0 * plane.y;
            pos.z = 1.0 * plane.z;
          }

          let dimension3D = floor(pow(totalSquares, 1.0 / 3.0));
          let dX3D = mod(floor(squareIDX / pow(dimension3D, 0.0)), dimension3D) - dimension3D * 0.5;
          let dY3D = mod(floor(squareIDX / pow(dimension3D, 1.0)), dimension3D) - dimension3D * 0.5;
          let dZ3D = mod(floor(squareIDX / pow(dimension3D, 2.0)), dimension3D) - dimension3D * 0.5;

          let gapper = 1.2;

          pos.x *= 0.3;
          pos.y *= 0.3;
          pos.z *= 0.0;

          pos.x += dX3D * gapper;
          pos.y += dY3D * gapper;
          pos.z += dZ3D * gapper;

          pos.x *= 3.45;
          pos.y *= 3.45;
          pos.z *= 3.45;

          ARR_VALUE[iii + 0] = pos.x
          ARR_VALUE[iii + 1] = pos.y
          ARR_VALUE[iii + 2] = pos.z

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

      uniform sampler2D vertexTexture;

      /*
        LIBRARY
      */
      #include <common>

      ${gui.compute}

      void main (void) {
        vUv = uv;
        vec4 data = compute();

        if ((length(data.rgb) > 0.0 || data.a > 0.0)) {
          gl_Position = projectionMatrix * modelViewMatrix * data;
          vPos = data.xyz;
        } else {
          vec4 pos = vec4(
            position.xyz,
            1.0
          );
          gl_Position = projectionMatrix * modelViewMatrix * pos;
          vPos = pos.xyz;
        }
      }
    `
  }

  static fragmentShader ({ gui }) {
    return glsl`
varying highp vec3 vPos;
varying highp vec2 vUv;
uniform sampler2D colorTexture;
void main (void) {
  vec4 texColor = texture2D(colorTexture, vUv);

  if (length(texColor.rgb) > 0.0 || texColor.a > 0.0) {
    gl_FragColor = texColor;
  } else {
    vec3 v_tt = normalize(vPos);
    gl_FragColor = vec4(
      1.0 - 0.25 + abs(v_tt.x),
      1.0 - 0.75 + abs(v_tt.y),
      1.0 - 0.25 + abs(v_tt.z),
      1.0
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

    this.setFragmentTexture = ({ texture }) => {
      this.shield.material.uniforms.colorTexture.value = texture
    }

    this.setVertexTexture = ({ texture }) => {
      this.shield.material.uniforms.vertexTexture.value = texture
    }
  }
}