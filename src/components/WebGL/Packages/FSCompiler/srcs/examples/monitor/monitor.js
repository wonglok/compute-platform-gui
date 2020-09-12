// import boxV from './shader/box.vert'
// import boxF from './shader/box.frag'

import { Pipeline } from './Pipeline.js'
// import * as Shaders from '../spec/Shaders.js'

export const use = async (box) => {

  // box.Shaders = Shaders
  let pipe = new Pipeline(box)

  let o3d = pipe.out.o3d

  box.scene.add(o3d)

  // let { GPUComputationRenderer } = await import('https://unpkg.com/three@0.119.1/examples/jsm/misc/GPUComputationRenderer.js')

  // let ctx = {}
  // ctx.geometry = new BoxBufferGeometry(25, 25, 25, 10, 10, 10)

  // let uniforms = {
  //   time: { value: 0 }
  // }
  // ctx.material = new ShaderMaterial({
  //   uniforms,
  //   wireframe: true,
  //   transparent: true,
  //   vertexShader: boxV,
  //   fragmentShader: boxF
  // });

  // onLoop(() => {
  //   uniforms.time.value = window.performance.now() * 0.001
  // })

  // let box = new Mesh(ctx.geometry, ctx.material)
  // scene.add(box)

  // onResize(() => {

  // })
}
