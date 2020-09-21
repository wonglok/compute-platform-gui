import { makeMaterial } from '../shared/material.js'
export const use = async ({ box, work }) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { MeshBasicMaterial, Points, SphereBufferGeometry, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box
  // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  let geo = new SphereBufferGeometry(80, 50, 50)
  let material = makeMaterial({ work, box })
  // let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#bebebe'), side: DoubleSide })
  let mesh = new Points(geo, material)

  camera.position.z = 150
  scene.background = new Color('#ffffff')

  if (material.defines) {
    material.defines.USE_POINTS = 'true'
    material.defines.DPI = (window.devicePixelRatio || 1.0).toFixed(1)
  }

  // box.onLoop(() => {
  //   // mesh.rotation.x += 0.01
  //   // mesh.rotation.y += 0.01
  // })

  // box.onRefresh(() => {
  //   mesh.material = makeMaterial({ work, box })
  // })

  // box.runRefresh()

  scene.add(mesh)
  // console.log(scene)

  box.onClean(() => {
    geo.dispose()
    material.dispose()
    console.log('clean up')
  })
}