export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let self = {
    mesh: false
  }
  workspaces.set(work._id, self)

  let geo = new BoxBufferGeometry(100, 100, 100, 5, 5, 5)
  let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#ffba00') })
  self.mesh = new Mesh(geo, mat)
  box.scene.add(self.mesh)

  console.log('context of run time', self.mesh, box, works, arrows)
  // box.scene.background = new Color('#ffba00')
}