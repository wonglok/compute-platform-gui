export const use = async ({ box, work }) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { MeshBasicMaterial, Mesh, PlaneBufferGeometry, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box
  // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#bebebe'), side: DoubleSide })
  let mesh = new Mesh(undefined, mat)

  camera.position.z = 120
  scene.background = new Color('#ffffff')

  box.onLoop(() => {
    // mesh.rotation.x += 0.01
    mesh.rotation.z += 0.01
  })

  // box.onRefresh(() => {
  //   let gui = work.guiData
  //   let geo = new PlaneBufferGeometry(gui.width, gui.height, gui.segmentX, gui.segmentY)
  //   mesh.geometry = geo
  //   mesh.geometry.needsUpdate = true
  // })

  let exec = () => {
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }
    let gui = work.guiData
    let geo = new PlaneBufferGeometry(gui.width, gui.height, gui.segmentX, gui.segmentY)
    mesh.geometry = geo
    mesh.geometry.needsUpdate = true
  }

  let tout = 0
  box.onRefresh(() => {
    clearTimeout(tout)
    tout = setTimeout(() => {
      exec()
    }, 20)
  })

  box.runRefresh()

  scene.add(mesh)
  // console.log(scene)

  box.onClean(() => {
    mesh.geometry.dispose()
    mat.dispose()
    console.log('clean up')
  })
}