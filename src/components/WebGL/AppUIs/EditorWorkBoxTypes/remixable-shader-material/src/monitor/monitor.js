import { makeMaterialAPI } from '../shared/material.js'

export const use = async ({ box, work }) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { MeshBasicMaterial, Mesh, Points, BoxBufferGeometry, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box
  let { workspaces } = box
  // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // let geo = new PlaneBufferGeometry(170, 170, 2, 2)
  workspaces.set(work._id, {
    installColorTexture: ({ texture }) => {
      installColorTexture({ texture })
    }
  })

  let geo = new BoxBufferGeometry(80, 80, 80, 3, 3, 3)
  let { material, installColorTexture } = makeMaterialAPI({ work, box })
  // let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#bebebe'), side: DoubleSide })
  let mesh = new Mesh(geo, material)

  // if (material.defines && mesh instanceof Points) {
  //   material.defines.USE_POINTS = 'true'
  //   material.defines.DPI = (window.devicePixelRatio || 1.0).toFixed(1)
  // }

  camera.position.z = 150
  scene.background = new Color('#ffffff')

  box.onLoop(() => {
    // mesh.rotation.x += 0.01
    // mesh.rotation.y += 0.01
  })

  // box.onRefresh(() => {
  //   mesh.material = makeMaterialAPI({ work, box })
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