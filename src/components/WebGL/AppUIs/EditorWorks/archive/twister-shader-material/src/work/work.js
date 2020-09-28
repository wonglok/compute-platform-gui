import { makeMaterial } from '../shared/material.js'
import { getConns } from '../util/util.js'

export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, SphereBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let self = {
    // material: makeMaterial({ work, box })
  }
  workspaces.set(work._id, self)

  let conns = await getConns({ work, arrows, works, workspaces })
  let myWork = work
  conns.forEach(({ api, work }) => {
    if (api.replaceMaterial) {
      api.replaceMaterial({ material: makeMaterial({ work: myWork, box }) })
    }
  })
}
