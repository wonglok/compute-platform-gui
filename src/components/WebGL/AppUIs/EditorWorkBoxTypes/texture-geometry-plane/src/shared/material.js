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

export class IndexTexture {
  constructor ({ THREE, sizeX, sizeY }) {
    let { DataTexture, RGBAFormat, FloatType } = THREE
    let size = sizeX * sizeY
    let type = FloatType
    let ARR_VALUE = new Float32Array(4 * size)

    let iii = 0

    let dimension = sizeX
    let total = sizeX * sizeY
    let ARR = ARR_VALUE
    for (var ix = 0; ix < dimension; ix++) {
      for (var iy = 0; iy < dimension; iy++) {
        // console.log(iii)
        let id = iii / 4

        ARR[iii + 0] = id % 6 // square vertex ID
        ARR[iii + 1] = Math.floor(id / 6) // square ID
        ARR[iii + 2] = total / 6.0 // percentage

        // dot id
        ARR[iii + 3] = id // point ID

        iii += 4
      }
    }

    var texture = new DataTexture(
      ARR_VALUE,
      sizeX,
      sizeY,
      RGBAFormat,
      type
    );
    texture.needsUpdate = true
    return texture
  }
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
      indexTexture: { value: null },
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
      uniform sampler2D indexTexture;

      uniform float time;
      // varying vec2 vUv;

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

      ${compute}

      void main() {
        gl_FragColor = compute();
      }
    `

    let passThruVertexShader = glsl`
      void main()	{
        gl_Position = vec4(position, 1.0);
      }
    `
    var material = new ShaderMaterial({
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
    let indexTexture = new IndexTexture({ THREE, sizeX, sizeY })
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

      if (mesh.material.uniforms.indexTexture) {
        if (mesh.material.uniforms.indexTexture.value !== indexTexture) {
          mesh.material.uniforms.indexTexture.value = indexTexture
        }
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

        if (api.setVertexTexture || api.setFragmentTexture) {
          box.onLoop(() => {
            let texture = this.getCurrentTextureOutput()
            let influenceType = myWork.guiData.influenceType
            if (influenceType === 'vertex') {
              api.setVertexTexture({ texture })
            } else if (influenceType === 'fragment') {
              api.setFragmentTexture({ texture })
            }
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