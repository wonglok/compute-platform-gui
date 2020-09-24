import * as Util from '../util/util.js'
export const use = async ({ box, work, works, arrows }) => {
  let gui = work.guiData
  let { Color, Mesh, BoxBufferGeometry, PlaneBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let self = {
    mesh: false
  }
  workspaces.set(work._id, self)

  let exec = async () => {
    let conns = await Util.getConns({ work, arrows, works, workspaces })
    conns.forEach(({ api, work }) => {
      if (api.replaceGeometry) {
        let geo = new BoxBufferGeometry(gui.width, gui.height, gui.depth, gui.segmentX, gui.segmentY, gui.segmentZ)
        api.replaceGeometry({ geometry: geo })
      }
    })
  }
  exec()

  let tout = 0
  box.onRefresh(() => {
    clearTimeout(tout)
    tout = setTimeout(() => {
      exec()
    }, 20)
  })
}
