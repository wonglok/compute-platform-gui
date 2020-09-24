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

export const makeComputeTextureAPI = ({ box, work }) => {
  let { Color, DoubleSide, ShaderMaterial, ClampToEdgeWrapping, NearestFilter, HalfFloatType, FloatType, RGBAFormat, WebGLRenderTarget, Scene, Camera, PlaneBufferGeometry, Mesh } = box.deps.THREE
  let gui = work.guiData

  let makeRenderTarget = ({ sizeX, sizeY }) => {
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

  let makeRenderMaterial = ({ compute, sizeX, sizeY }) => {
    var passThruUniforms = {
      time: { value: 0 },
      addonTexture: { value: null },
      passThruTexture: { value: null }
    };

    box.onLoop(() => {
      let time = window.performance.now() * 0.001
      passThruUniforms.time.value = time
    })

    let passThruFragmentShader = glsl`
      uniform sampler2D addonTexture;
      uniform sampler2D passThruTexture;
      uniform float time;
      varying vec2 vUv;

      ${compute}

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 lastColor = texture2D( passThruTexture, uv );
        vec4 addonColor = texture2D( addonTexture, uv );
        vec4 nextColor = lastColor;

        compute(nextColor, lastColor, addonColor);

        gl_FragColor = nextColor;
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

  var scene = new Scene();
  var camera = new Camera();
  camera.position.z = 1;

  let sizeX = gui.sizeX
  let sizeY = gui.sizeY
  let flipper = 0
  let targetA = makeRenderTarget({ sizeX, sizeY })
  let targetB = makeRenderTarget({ sizeX, sizeY })
  let material = makeRenderMaterial({ compute: gui.compute, sizeX, sizeY })
  var mesh = new Mesh(
    new PlaneBufferGeometry(2, 2),
    material
  )
  scene.add(mesh)

  console.log(box)

  box.onLoop(() => {
    if (flipper % 2 === 0) {
      mesh.material.uniforms.passThruTexture.value = targetA.texture
    } else {
      mesh.material.uniforms.passThruTexture.value = targetB.texture
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

  let getCurrentTextureOutput = () => {
    if (flipper % 2 === 0) {
      return targetA.texture
    } else {
      return targetB.texture
    }
  }

  let getOtherTextureOutput = () => {
    if (flipper % 2 === 1) {
      return targetA.texture
    } else {
      return targetB.texture
    }
  }

  let getMaterial = () => {
    return mesh.material
  }

  let addTexture = ({ texture }) => {
    mesh.material.uniforms.addonTexture.value = texture
  }

  let lastCompute = gui.compute
  let compile = () => {
    let sizeX = gui.sizeX
    let sizeY = gui.sizeY
    targetA = makeRenderTarget({ sizeX, sizeY })
    targetB = makeRenderTarget({ sizeX, sizeY })
    mesh.material = makeRenderMaterial({ compute: gui.compute, sizeX, sizeY })
  }
  box.onRefresh(() => {
    if (lastCompute !== gui.compute) {
      compile()
      lastCompute = gui.compute
    }
  })

  return {
    addTexture,
    getMaterial,
    compile,

    getCurrentTextureOutput,
    getOtherTextureOutput
  }
}
