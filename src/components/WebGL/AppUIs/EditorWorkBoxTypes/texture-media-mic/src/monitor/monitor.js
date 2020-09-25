import { makeComputeTextureAPI } from '../shared/material.js'
import * as Util from '../util/util.js'

export const use = async ({ box, work, arrows, works }) => {
  let { MeshBasicMaterial, Mesh, Points, PlaneBufferGeometry, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box

  let setup = async () => {
    let computeAPI = makeComputeTextureAPI({ box, work })

    let mat = new MeshBasicMaterial({ color: new Color('#ffffff'), opacity: 0, transparent: true, side: DoubleSide })

    let geo = new PlaneBufferGeometry(150, 150, 3, 3)
    let mesh = new Mesh(geo, mat)
    scene.add(mesh)
    camera.position.z = 100
    scene.background = new Color('#000000')

    box.onClean(() => {
      geo.dispose()
      mat.dispose()
      console.log('clean up')
    })

    box.onLoop(() => {
      let texture = computeAPI.getCurrentTextureOutput()
      if (box.deps.media.micNow) {
        mat.map = texture
        mat.opacity = 1
        mat.needsUpdate = true
      }
    })

    let workspaces = box.workspaces
    let conns = await Util.getConns({ work, arrows, works, workspaces })
    let myWork = work
    conns.forEach(({ api, work }) => {
      if (api.setVertexTexture) {
        box.onLoop(() => {
          let texture = computeAPI.getCurrentTextureOutput()
          api.setVertexTexture({ texture })
        })
      }
    })
  }
  setup()
}