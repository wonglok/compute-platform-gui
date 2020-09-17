export const use = async ({ box, work, works, arrows }) => {
  let { Color, LineSegments, PlaneBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let api = {
    replaceGeometry: ({ geometry }) => {
      api.drawItem.geometry = geometry
      geometry.needsUpdate = true
    },
    replaceMaterial: ({ material }) => {
      if (!api.drawItem.material === material) {
        api.drawItem.material = material
        material.needsUpdate = true
      }
    },
    replaceDrawItem: ({ drawItem }) => {
      box.scene.remove(api.drawItem)
      api.drawItem = drawItem
      box.scene.add(api.drawItem)
    },
    drawItem: false
  }
  workspaces.set(work._id, api)

  let geo = new PlaneBufferGeometry(120, 120, 30, 30)
  let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#bebebe') })
  api.drawItem = new LineSegments(geo, mat)
  box.scene.add(api.drawItem)

  // console.log('context of run time', api.drawItem, box, works, arrows)
  // box.scene.background = new Color('#ffba00')
}