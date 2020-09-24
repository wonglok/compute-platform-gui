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

export const makeMaterialAPI = ({ box, work }) => {
  let gui = work.guiData

  let { ShaderMaterial, DoubleSide, Color, Points } = box.deps.THREE

  let defines = {
    DPI: `${(window.devicePixelRatio || 1).toFixed(1)}`
  }

  let uniforms = {
    colorTexture: { type: 't', value: null },
    vertexTexture: { type: 't', value: null },
    pointSize: { type: 'f', value: 5 },
    time: { type: 't', value: 0 }
  }

  box.onLoop(() => {
    for (let kn in gui) {
      if (uniforms[kn]) {
        if (uniforms[kn].type === 'f') {
          uniforms[kn].value = gui[kn]
        } else if (uniforms[kn].type === 'c') {
          uniforms[kn].value.set(gui[kn])
        }
      }
    }
  })

  let compiled = {
    vsLib: '',
    vsMain: '',
    fsLib: '',
    fsMain: ''
  }

  let mvs = glsl`
varying vec2 vUv;

uniform float pointSize;

#ifdef USE_VERTEX_TEXTURE
  uniform sampler2D vertexTexture;
#endif

uniform float time;

${compiled.vsLib}

void main(void) {
  vec3 newPos = position;
  vUv = uv;

  #ifdef USE_VERTEX_TEXTURE
    newPos += texture2D(vertexTexture, vUv).xyz;
  #endif

  ${compiled.vsMain}

  #ifdef USE_POINTS
    #ifdef DPI
      gl_PointSize = pointSize * DPI;
    #else
      gl_PointSize = pointSize;
    #endif
  #endif

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`

  let mfs = glsl`
varying vec2 vUv;

uniform float time;

#ifdef USE_COLOR_TEXTURE
  uniform sampler2D colorTexture;
#endif

${compiled.fsLib}

void main (void) {
  vec4 outColor = vec4(vec3(vUv.x, vUv.y, vUv.x), 0.5);

  #ifdef USE_COLOR_TEXTURE
    outColor = texture2D(colorTexture, vUv);
    #endif

  ${compiled.fsMain}

  #ifdef USE_POINTS
    if (length(gl_PointCoord.xy - 0.5) >= 0.5) {
      discard;
    } else {
      gl_FragColor = outColor;
    }
  #else
    gl_FragColor = outColor;
  #endif

}
`

  box.onLoop(() => {
    let time = window.performance.now() * 0.001
    uniforms.time.value = time
  })

  let material = new ShaderMaterial({
    transparent: true,
    side: DoubleSide,
    defines,
    uniforms,
    vertexShader: mvs,
    fragmentShader: mfs
  })
  material.needsUpdate = true

  // box.onRefresh(() => {
  //   material.vertexShader = mvs
  //   material.fragmentShader = mfs
  //   material.needsUpdate = true
  // })

  let installColorTexture = ({ texture }) => {
    defines.USE_COLOR_TEXTURE = 'true'
    uniforms.colorTexture.value = texture
    material.needsUpdate = true
  }

  let installVertexTexture = ({ texture }) => {
    defines.USE_VERTEX_TEXTURE = 'true'
    uniforms.vertexTexture.value = texture
    material.needsUpdate = true
  }

  return {
    installColorTexture,
    installVertexTexture,
    material
  }
}
