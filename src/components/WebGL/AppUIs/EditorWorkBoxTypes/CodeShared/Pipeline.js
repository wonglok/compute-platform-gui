// import * as Shaders from './Shaders.js'
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

export class Pipeline {
  constructor (box) {
    let { onLoop, onClean, deps } = box
    this.Shaders = box.deps.Shaders
    this.userData = box.userData
    this.box = box
    this.onClean = onClean
    this.onLoop = onLoop
    this.deps = deps
    this.camera = box.userData.camera

    let { Object3D, Color } = this.deps.THREE
    this.box.userData.scene.background = new Color('#000000')

    this.o3d = new Object3D()

    this.out = {
      o3d: this.o3d
    }

    this.camera.position.z = 100
    let config = this.getDefaultConfig()

    config.extraUniforms = [
      ...config.extraUniforms,
      ...this.userData.work.guiData.extraUniforms
    ]

    this.config = config

    console.log(box.userData)
  }

  getNewAttr () {
    return {
      needsUpdate: true,
      count: 4,
      type: 'vec4',
      name: 'specialSpeed_' + (Math.random() * 100).toFixed(0),
      isDynamic: false,
      terser: `
// 'x', 'y', 'z', 'dimension', 'totalUnits', 'unitID', 'vertexID', 'totalVetex', 'out'

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

  getDefaultConfig () {
    return {
      WIDTH: 48,
      extraAttrs: [
        {
          needsUpdate: true,
          count: 4,
          type: 'vec4',
          name: 'specialColor',
          isDynamic: false,
          terser: `
//'x', 'y', 'z', 'dimension', 'totalUnits', 'unitID', 'vertexID', 'totalVetex', 'out'

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
        },
        {
          name: 'micNow',
          type: 'sampler2D',
          updater: 'mic-now',
          needsAuhtorises: true,
          value: null
        },

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
      vertexMain: this.Shaders.starter.v,
      fragmentMain: this.Shaders.starter.f
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
    let { Object3D, BufferGeometry, BufferAttribute, ShaderMaterial, DoubleSide, Mesh } = this.deps.THREE
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
    let defines = {}


    let uniformStr = ``
    config.extraUniforms.forEach(uniform => {
      uniformStr += `
        uniform ${uniform.type} ${uniform.name};
      `
      uniforms[uniform.name] = { value: uniform.value }
      defines[`DEF_${uniform.name}`] = 'TRUE'
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

      ${config.vertexLib || ''}
      ${this.Shaders.lib.ball}
      ${this.Shaders.lib.rotate}

      ${config.vertexMain}
    `

    let fragmentShader = glsl`
      #define RESOLUTION vec2(${UVSize}, ${UVSize})
      uniform float time;
      ${uniformStr}
      ${config.varyingsStr}

      ${config.fragLib || ''}

      ${this.Shaders.lib.ball}
      ${this.Shaders.lib.rotate}

      ${config.fragmentMain}
    `

    let blockersToken = `/* INSERT_REMIX_CODE */`
    vertexShader = vertexShader.replace(blockersToken, this.box.vertexCode || '')
    fragmentShader = fragmentShader.replace(blockersToken, this.box.fragmentCode || '')

    this.mat = new ShaderMaterial({
      defines,
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

    let fnCall = new Function('x', 'y', 'z', 'dimension', 'totalUnits', 'unitID', 'vertexID', 'totalVetex', 'out', attr.terser)

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
