import { makeComputeTextureAPI } from '../shared/material.js'
import * as Util from '../util/util.js'

export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, SphereBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box

  let self = {
    computeTextureAPI: makeComputeTextureAPI({ box, work }),
    installColorTexture: ({ texture }) => {
      self.computeTextureAPI.addTexture({ texture })
    }
  }

  let myWork = work
  let conns = await Util.getConns({ work, arrows, works, workspaces })
  console.log(conns)
  conns.forEach(({ api, work }) => {
    if (api.setVertexTexture) {
      box.onLoop(() => {
        let texture = self.computeTextureAPI.getCurrentTextureOutput()
        api.setVertexTexture({ texture })
      })
    }
  })

  workspaces.set(work._id, self)
}