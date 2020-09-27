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
    geo.setAttribute('uv', new BufferAttribute(this.makeUV(), 2))
    geo.setAttribute('meta', new BufferAttribute(this.makeMeta(), 4))
    return geo
  }

  makeUV () {
    let ARR_VALUE = []
    let WIDTH = this.width
    let iii = 0
    for (var ix = 0; ix < WIDTH; ix++) {
      for (var iy = 0; iy < WIDTH; iy++) {
        // console.log(iii)
        // let id = iii / 2

        ARR_VALUE[iii + 0] = (ix) / WIDTH
        ARR_VALUE[iii + 1] = (iy) / WIDTH

        iii += 2
      }
    }
    return new Float32Array(ARR_VALUE)
  }

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

          ARR_VALUE[iii + 0] = (ix - (dimension * 0.5)) / dimension
          ARR_VALUE[iii + 1] = (iy - (dimension * 0.5)) / dimension
          ARR_VALUE[iii + 2] = (iz - (dimension * 0.5)) / dimension

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
      fragmentTexture: { value: null },
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

      varying highp vec3 vPos;
      varying highp vec2 vUv;
      attribute vec4 meta;

      uniform sampler2D vertexTexture;

      /*
        LIBRARY
      */
      #include <common>

      ${gui.compute}

      void main (void) {
        vUv = uv;
        gl_PointSize = 1.0;

        vec4 data = compute();
        gl_Position = projectionMatrix * modelViewMatrix * data;
        vPos = data.xyz;
      }
    `
  }

  static fragmentShader ({ gui }) {
    return glsl`
varying highp vec3 vPos;
varying highp vec2 vUv;
uniform sampler2D fragmentTexture;

void main (void) {
  vec4 texFragment = texture2D(fragmentTexture, vUv);

  if (length(texFragment.rgb) > 0.0 || texFragment.a > 0.0) {
    gl_FragColor = texFragment;
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

    this.shield = new this.THREE.Points(this.shieldGeo, this.shieldMat)

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
      this.shield.material.uniforms.fragmentTexture.value = texture
    }

    this.setVertexTexture = ({ texture }) => {
      this.shield.material.uniforms.vertexTexture.value = texture
    }
  }
}