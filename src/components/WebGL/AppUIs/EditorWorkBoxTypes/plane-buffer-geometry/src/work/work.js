import * as Util from '../util/util.js'
export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, PlaneBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let self = {
    mesh: false
  }
  workspaces.set(work._id, self)

  let exec = async () => {
    let gui = work.guiData
    let conns = await Util.getConns({ work, arrows, works, workspaces })
    conns.forEach(({ api, work }) => {
      if (api.replaceGeometry) {
        let geo = new PlaneBufferGeometry(gui.width, gui.height, gui.segmentX, gui.segmentY)
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
