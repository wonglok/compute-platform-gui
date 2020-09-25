import * as Util from '../util/util.js'

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

export class MyRenderTarget {
  constructor ({ THREE, sizeX, sizeY }) {
    let { WebGLRenderTarget, ClampToEdgeWrapping, NearestFilter, RGBAFormat, HalfFloatType, FloatType } = THREE

    var renderTarget = new WebGLRenderTarget( sizeX, sizeY, {
			wrapS: ClampToEdgeWrapping,
			wrapT: ClampToEdgeWrapping,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
      format: RGBAFormat,
      // type: this.defaultTextureType,
			type: ( /(iPad|iPhone|iPod|Apple)/g.test( navigator.userAgent ) ) ? HalfFloatType : FloatType,
			stencilBuffer: false,
			depthBuffer: false
    });

    return renderTarget
  }
}

export class MyRenderMaterial {
  constructor ({ box, compute, sizeX, sizeY, THREE }) {
    let { ShaderMaterial, DoubleSide } = THREE
    var passThruUniforms = {
      time: { value: 0 },
      recordedMicTexture: { value: null },
      realtimeMicTexture: { value: null },
      addonTexture: { value: null },
      passThruTexture: { value: null }
    };

    box.onLoop(() => {
      let time = window.performance.now() * 0.001
      passThruUniforms.time.value = time
    })

    let passThruFragmentShader = glsl`

      uniform sampler2D realtimeMicTexture;
      uniform sampler2D recordedMicTexture;
      uniform sampler2D addonTexture;
      uniform sampler2D passThruTexture;
      uniform float time;
      varying vec2 vUv;

      ${compute}

      void main() {

        gl_FragColor = compute();
      }
    `

    let passThruVertexShader = glsl`
    varying vec2 vUv;
    void main()	{
        vUv = uv;
        gl_Position = vec4( position, 1.0 );
      }
    `
    var material = new ShaderMaterial( {
      side: DoubleSide,
      defines: {
        resolution: `vec2(${Number(sizeX || 0).toFixed(1)}, ${Number(sizeY || 0).toFixed(1)})`
      },
      uniforms: passThruUniforms,
      vertexShader: passThruVertexShader,
      fragmentShader: passThruFragmentShader
    });

    return material
  }
}

export class MicTexture {
  constructor ({ box, work, works, arrows, mode }) {
    this.work = work
    this.box = box
    this.THREE = box.deps.THREE
    let THREE = this.THREE

    let { Mesh, PlaneBufferGeometry, Scene, Camera } = THREE

    let gui = work.guiData

    var scene = new Scene();
    var camera = new Camera();
    camera.position.z = 1;

    let sizeX = gui.sizeX
    let sizeY = gui.sizeY
    let flipper = 0
    let targetA = new MyRenderTarget({ THREE, sizeX, sizeY })
    let targetB = new MyRenderTarget({ THREE, sizeX, sizeY })
    let material = new MyRenderMaterial({ box, THREE, compute: gui.compute, sizeX, sizeY })
    var mesh = new Mesh(
      new PlaneBufferGeometry(2, 2),
      material
    )
    scene.add(mesh)

    box.onLoop(() => {
      if (flipper % 2 === 0) {
        mesh.material.uniforms.passThruTexture.value = targetA.texture
      } else {
        mesh.material.uniforms.passThruTexture.value = targetB.texture
      }

      if (box.deps.media.micNow) {
        mesh.material.uniforms.realtimeMicTexture.value = box.deps.media.micNow.getTexture()
      }
      if (box.deps.media.micPast) {
        mesh.material.uniforms.recordedMicTexture.value = box.deps.media.micPast.getTexture()
      }

      let lastTarget = box.renderer.getRenderTarget()

      if (flipper % 2 === 0) {
        box.renderer.setRenderTarget(targetB)
      } else {
        box.renderer.setRenderTarget(targetA)
      }

      box.renderer.render(scene, camera)
      box.renderer.setRenderTarget(lastTarget)
      flipper++
    })

    this.getCurrentTextureOutput = () => {
      if (flipper % 2 === 0) {
        return targetA.texture
      } else {
        return targetB.texture
      }
    }

    this.getOtherTextureOutput = () => {
      if (flipper % 2 === 1) {
        return targetA.texture
      } else {
        return targetB.texture
      }
    }

    this.getMaterial = () => {
      return mesh.material
    }

    this.addTexture = ({ texture }) => {
      mesh.material.uniforms.addonTexture.value = texture
      mesh.material.needsUpdate = true
    }

    let lastCompute = gui.compute
    let lastSize = ''
    let compileSize = () => {
      let sizeX = gui.sizeX
      let sizeY = gui.sizeY
      let compute = gui.compute
      targetA = new MyRenderTarget({ THREE, sizeX, sizeY })
      targetB = new MyRenderTarget({ THREE, sizeX, sizeY })
      mesh.material = new MyRenderMaterial({ box, THREE, compute, sizeX, sizeY })
    }
    let compileMat = () => {
      let sizeX = gui.sizeX
      let sizeY = gui.sizeY
      let compute = gui.compute
      mesh.material = new MyRenderMaterial({ box, THREE, compute, sizeX, sizeY })
    }

    box.onRefresh(() => {
      if (lastCompute !== gui.compute) {
        compileMat()
        lastCompute = gui.compute
      }
      if (lastSize !== gui.sizeX) {
        compileSize()
        lastSize = gui.sizeX
      }
    })

    this.setupPreivew = async () => {
      let { MeshBasicMaterial, Color, DoubleSide } = THREE
      let mat = new MeshBasicMaterial({ color: new Color('#ffffff'), opacity: 0, transparent: true, side: DoubleSide })
      let geo = new PlaneBufferGeometry(150, 150, 3, 3)
      let preview = new Mesh(geo, mat)
      box.scene.add(preview)
      box.camera.position.z = 100
      box.scene.background = new Color('#000000')

      box.onLoop(() => {
        let texture = this.getCurrentTextureOutput()
        if (box.deps.media.micNow) {
          mat.map = texture
          mat.opacity = 1
          mat.needsUpdate = true
        }
      })
    }

    this.setupWorkspaces = async () => {
      let workspaces = box.workspaces
      let conns = await Util.getConns({ work, arrows, works, workspaces })
      let myWork = work
      conns.forEach(({ api, work }) => {
        if (api.addTexture) {
          box.onLoop(() => {
            let texture = this.getCurrentTextureOutput()
            api.addTexture({ texture })
          })
        }

        if (api.setVertexTexture) {
          box.onLoop(() => {
            let texture = this.getCurrentTextureOutput()
            api.setVertexTexture({ texture })
          })
        }
      })
    }

    if (mode === 'preview') {
      this.setupPreivew()
    }
    this.setupWorkspaces()
  }
}