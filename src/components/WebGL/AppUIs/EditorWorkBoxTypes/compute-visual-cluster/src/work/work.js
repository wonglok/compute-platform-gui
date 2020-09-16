import { Pipeline } from '../shared/Pipeline.js'
export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, PlaneBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let api = {
    // replaceGeometry: ({ geometry }) => {
    //   api.drawItem.geometry = geometry
    //   geometry.needsUpdate = true
    // },
    // replaceMaterial: ({ material }) => {
    //   api.drawItem.material = material
    //   material.needsUpdate = true
    // },
    // replaceDrawItem: ({ drawItem }) => {
    //   box.scene.remove(api.drawItem)
    //   api.drawItem = drawItem
    //   box.scene.add(api.drawItem)
    // },
    // drawItem: false
  }
  workspaces.set(work._id, api)

  // let geo = new PlaneBufferGeometry(120, 120, 80, 80)
  // // let geo = new BoxBufferGeometry(80, 80, 80, 24, 24, 24)
  // let mat = new MeshBasicMaterial({ wireframe: false, color: new Color('#bebebe') })
  // api.drawItem = new Mesh(geo, mat)
  // box.scene.add(api.drawItem)

  let pipe = new Pipeline({ box, work })
  api.pipe = pipe
  box.scene.add(pipe.out.o3d)


  // console.log('context of run time', api.drawItem, box, works, arrows)
  // box.scene.background = new Color('#ffba00')
}