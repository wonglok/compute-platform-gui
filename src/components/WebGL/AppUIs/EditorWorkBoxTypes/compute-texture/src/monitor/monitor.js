import { makeComputeTextureAPI } from '../shared/material.js'
import * as Util from '../util/util.js'

export const use = async ({ box, work, arrows, works }) => {
  let { MeshBasicMaterial, Mesh, Points, PlaneBufferGeometry, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box

  let setup = async () => {
    let computeAPI = makeComputeTextureAPI({ box, work })

    let mat = new MeshBasicMaterial({ color: new Color('#ffffff'), side: DoubleSide })

    let geo = new PlaneBufferGeometry(150, 150, 3, 3)
    let mesh = new Mesh(geo, mat)
    scene.add(mesh)
    camera.position.z = 100
    scene.background = new Color('#ffffff')

    box.onClean(() => {
      geo.dispose()
      mat.dispose()
      console.log('clean up')
    })

    box.onLoop(() => {
      let texture = computeAPI.getCurrentTextureOutput()
      mat.map = texture
      mat.needsUpdate = true
    })

    let workspaces = box.workspaces
    let conns = await Util.getConns({ work, arrows, works, workspaces })
    let myWork = work
    conns.forEach(({ api, work }) => {
      if (api.installColorTexture) {
        box.onLoop(() => {
          let texture = computeAPI.getCurrentTextureOutput()
          api.installColorTexture({ texture })
        })
      }
    })
  }
  setup()

  // // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  //
  // let { scene, camera } = box
  // // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // // let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  // let geo = new PlaneBufferGeometry(80, 80, 3, 3)
  // let { getCurrentTextureOutput } = makeComputeTextureAPI({ work, box })
  // // let material = getCurrentTextureOutput()
  // let mat = new MeshBasicMaterial({ wireframe: false, color: new Color('#bebebe'), side: DoubleSide })
  // let mesh = new Mesh(geo, mat)

  // // if (material.defines && mesh instanceof Points) {
  // //   material.defines.USE_POINTS = 'true'
  // //   material.defines.DPI = (window.devicePixelRatio || 1.0).toFixed(1)
  // // }

  // camera.position.z = 150
  // scene.background = new Color('#ffffff')

  // box.onLoop(() => {
  //   mat.map = getCurrentTextureOutput()
  //   mat.needsUpdate = true
  //   // mesh.rotation.x += 0.01
  //   // mesh.rotation.y += 0.01
  // })

  // // box.onRefresh(() => {
  // //   mesh.material = makeComputeTextureAPI({ work, box })
  // // })

  // // box.runRefresh()

  // scene.add(mesh)
  // // console.log(scene)

  // box.onClean(() => {
  //   geo.dispose()
  //   mat.dispose()
  //   console.log('clean up')
  // })
}