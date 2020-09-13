export const use = (box) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { MeshBasicMaterial, Mesh, BoxBufferGeometry, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box
  // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  let geo = new BoxBufferGeometry(80, 80, 80, 5, 5, 5)
  let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#ffffff'), side: DoubleSide })
  let mesh = new Mesh(geo, mat)

  camera.position.z = 150
  scene.background = new Color('#bebebe')

  box.onLoop(() => {
    // mesh.rotation.x += 0.01
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