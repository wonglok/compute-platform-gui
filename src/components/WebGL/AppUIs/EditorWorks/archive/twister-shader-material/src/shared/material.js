import mvs from './m-vertex.glsl'
import mfs from './m-fragment.glsl'
export const makeMaterial = ({ box, work }) => {
  let gui = work.guiData
  let { ShaderMaterial, Color, Points } = box.deps.THREE

  let defines = {
  }
  let uniforms = {
    micNow: { type: 'mic-now', value: null },
    micPast: { type: 'mic-past', value: null },
    pointSize: { type: 'f', value: 5.47 },
    twisterX: { type: 'f', value: 0.334 },
    twisterY: { type: 'f', value: 0.344 },
    twisterZ: { type: 'f', value: 0.074 },
    twisterSpeedX: { type: 'f', value: 0.074 },
    twisterSpeedY: { type: 'f', value: 0.8 },
    twisterSpeedZ: { type: 'f', value: 0.1 },
    offsetModifier: { type: 'c', value: new Color('#7d747d') },
    baseColor: { type: 'c', value: new Color('#28fa92') },
    time: { type: 't', value: 0 }
  }

  // console.log(box.deps)

  box.onLoop(() => {
    for (let kn in gui) {
      if (uniforms[kn].type === 'f') {
        uniforms[kn].value = gui[kn]
      } else if (uniforms[kn].type === 'c') {
        uniforms[kn].value.set(gui[kn])
      }
    }

    for (let kn in uniforms) {
      if (uniforms[kn].type === 'mic-now' && box.deps.media && box.deps.media.micNow) {
        let micNow = box.deps.media.micNow.getTexture()
        uniforms[kn].value = micNow
      } else if (uniforms[kn].type === 'mic-past' && box.deps.media && box.deps.media.micPast) {
        let micPast = box.deps.media.micPast.getTexture()
        uniforms[kn].value = micPast
      }
    }
  })

  box.onLoop(() => {
    let time = window.performance.now() * 0.001
    uniforms.time.value = time
  })

  let material = new ShaderMaterial({
    transparent: true,
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
