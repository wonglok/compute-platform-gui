import { MicTexture } from '../shared/material.js'
import * as Util from '../util/util.js'

export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, SphereBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box

  let engine = new MicTexture({ box, work, works, arrows, mode: 'work' })

  workspaces.set(work._id, engine)
}
