export const use = (box) => {
  if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
    let { TextureLoader, MeshBasicMaterial, Mesh, PlaneBufferGeometry, Color, DoubleSide } = box.deps.THREE
    let { scene, camera } = box.userData
    let texture = new TextureLoader().load(box.userData.work.coverImage)
    let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
    let geo = new PlaneBufferGeometry(170, 170, 2, 2)
    let mesh = new Mesh(geo, mat)

    camera.position.z = 100
    scene.background = new Color('#ffffff')

    box.onLoop(() => {
      // mesh.rotation.x += 0.01
      // mesh.rotation.y += 0.01
    })

    scene.add(mesh)
    console.log(scene)

    box.onClean(() => {
      geo.dispose()
      mat.dispose()
      console.log('clean up')
    })
  }
}