export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, SphereBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let self = {
    mesh: false
  }
  workspaces.set(work._id, self)

  let getFirstConnectedItem = ({ work }) => {
    let itemA = work
    let arrowAB = arrows.find(e => e.from === itemA._id)
    if (arrowAB) {
      let itemB = works.find(e => e._id === arrowAB.to)
      let spaceB = workspaces.get(itemB._id)
      if (spaceB) {
        return spaceB
      } else {
        return false
      }
    } else {
      return false
    }
  }

  let connectedItem = getFirstConnectedItem({ work })
  if (connectedItem && connectedItem.replaceGeometry) {
    connectedItem.replaceGeometry({ geometry: new SphereBufferGeometry(60, 36, 36) })
  }

  // let geo = new BoxBufferGeometry(100, 100, 100, 5, 5, 5)
  // let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#ffba00') })
  // self.mesh = new Mesh(geo, mat)
  // box.scene.add(self.mesh)

  // console.log('context of run time', self.mesh, box, works, arrows)
  // box.scene.background = new Color('#ffba00')
}