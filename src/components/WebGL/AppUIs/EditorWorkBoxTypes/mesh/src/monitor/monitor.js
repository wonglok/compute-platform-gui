export const use = ({ box, work }) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { MeshBasicMaterial, Mesh, BoxBufferGeometry, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box
  // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  // let directionaLight = new PointLight(0xffffff, 1, 1500, 2)
  // directionaLight.position.x = 300
  // directionaLight.position.y = 300
  // directionaLight.position.z = 300
  // scene.add(directionaLight)

  let geo = new BoxBufferGeometry(80, 80, 80, 8, 8, 8)
  let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#bebebe'), side: DoubleSide })
  let mesh = new Mesh(geo, mat)

  camera.position.z = 150
  scene.background = new Color('#ffffff')

  box.onLoop(() => {
    mesh.rotation.y += 0.01
  })

  scene.add(mesh)

  // console.log(scene)

  box.onClean(() => {
    geo.dispose()
    mat.dispose()
    console.log('clean up')
  })
  // }
}