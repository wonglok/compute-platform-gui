import { makeMaterialAPI } from '../shared/material.js'
import * as Util from '../util/util.js'

export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, SphereBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box

  let self = {
    matAPIs: [],
    installColorTexture: (args) =>  {
      self.matAPIs.forEach((e) => {
        if (e.installColorTexture) {
          e.installColorTexture(args)
        }
      })
    },
    installVertexTexture: (args) =>  {
      self.matAPIs.forEach((e) => {
        if (e.installVertexTexture) {
          e.installVertexTexture(args)
        }
      })
    }
  }

  let myWork = work
  let conns = await Util.getConns({ work, arrows, works, workspaces })
  conns.forEach(({ api, work }) => {
    if (api.replaceMaterial) {
      let matAPI = makeMaterialAPI({ work: myWork, box })
      self.matAPIs.push(matAPI)
      api.replaceMaterial({ material: matAPI.material })
    }
  })

  workspaces.set(work._id, self)
}
