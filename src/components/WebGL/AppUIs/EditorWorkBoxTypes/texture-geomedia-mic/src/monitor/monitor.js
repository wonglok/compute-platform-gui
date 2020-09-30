import { MicTexture } from '../shared/material.js'
// import * as Util from '../util/util.js'

export const use = async ({ box, work, arrows, works }) => {
  let { Color } = box.deps.THREE
  let { scene, camera } = box

  let setup = async () => {
    let engine = new MicTexture({ box, work, works, arrows, mode: 'preview' })
    let workspaces = box.workspaces

    scene.background = new Color('#ffffff')
    workspaces.set(work._id, engine)
  }
  setup()
}
