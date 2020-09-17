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

export const makeMaterial = ({ box, work, nodes }) => {
  let gui = work.guiData

  let compiled = {
    vsLib: '',
    vsMain: '',
    fsLib: '',
    fsMain: ''
  }

  let { ShaderMaterial, DoubleSide, Color, Points } = box.deps.THREE

  let defines = {
    DPI: `${(window.devicePixelRatio || 1).toFixed(1)}`
  }

  let uniforms = {
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

  let mvs = glsl`
varying vec2 vUv;

uniform float pointSize;
uniform float time;

${compiled.vsLib}

void main(void) {
  vec3 newPos = position;
  vUv = uv;

  ${compiled.vsMain}

  #ifdef USE_POINTS
    gl_PointSize = pointSize * DPI;
  #endif

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`

  let mfs = glsl`
varying vec2 vUv;

uniform float time;

${compiled.fsLib}

void main (void) {
  vec4 outColor = vec4(vec3(vUv.x, vUv.y, vUv.x), 0.5);

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

  // box.onRefresh(() => {
  //   material.vertexShader = mvs
  //   material.fragmentShader = mfs
  //   material.needsUpdate = true
  // })

  return material
}
