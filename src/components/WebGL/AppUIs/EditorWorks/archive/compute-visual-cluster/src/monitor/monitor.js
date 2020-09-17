// import { Pipeline } from '../shared/Pipeline.js'
export const use = ({ box, work }) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { MeshBasicMaterial, Mesh, PlaneBufferGeometry, Color, DoubleSide, TextureLoader } = box.deps.THREE
  let { scene, camera } = box
  let texture = new TextureLoader().load(work.coverImage)
  let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), transparent: true, side: DoubleSide })
  let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  // let directionaLight = new PointLight(0xffffff, 1, 1500, 2)
  // directionaLight.position.x = 300
  // directionaLight.position.y = 300
  // directionaLight.position.z = 300
  // scene.add(directionaLight)

  // let pipe = new Pipeline({ box, work })
  // box.scene.add(pipe.out.o3d)

  // let geo = new PlaneBufferGeometry(120, 120, 80, 80)
  // let mat = new MeshBasicMaterial({ wireframe: false, color: new Color('#bebebe'), side: DoubleSide })
  let mesh = new Mesh(geo, mat)

  camera.position.z = 150
  scene.background = new Color('#ffffff')

  // box.onLoop(() => {
  //   mesh.rotation.z += 0.01
  // })

  scene.add(mesh)

  // // console.log(scene)

  // box.onClean(() => {
  //   geo.dispose()
  //   mat.dispose()
  //   console.log('clean up')
  // })
  // // }
}