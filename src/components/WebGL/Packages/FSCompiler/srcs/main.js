import boxV from './shader/box.vert'
import boxF from './shader/box.frag'

export const use = async (execEnv) => {
  let { THREE, onLoop, onResize, onClean, scene, cachedImport } = execEnv
  let { Mesh, BoxBufferGeometry, MeshBasicMaterial, Color } = THREE
  // let { GPUComputationRenderer } = await import('https://unpkg.com/three@0.119.1/examples/jsm/misc/GPUComputationRenderer.js')

  let geo = new BoxBufferGeometry(25, 25, 25, 10, 10, 10)

  let uniforms = {
    time: { value: 0 }
  }
  var mat = new THREE.ShaderMaterial({
    uniforms,
    wireframe: true,
    transparent: true,
    vertexShader: boxV,
    fragmentShader: boxF
  });

  let box = new Mesh(geo, mat)
  onLoop(() => {
    uniforms.time.value = window.performance.now() * 0.001
  })

  onResize(() => {

  })

  scene.add(box)
}
