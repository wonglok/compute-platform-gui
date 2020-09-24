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
}