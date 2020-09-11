export const prepareRuntime = async ({ THREE, miniBox }) => {
  let box = miniBox
  let { Scene, WebGLRenderer, PerspectiveCamera } = THREE

  var camera = box.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 150

  box.onResize(() => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })

  box.renderer = new WebGLRenderer({
    antialias: true,
    alpha: true
  })
  box.onResize(() => {
    box.renderer.setSize(window.innerWidth, window.innerHeight)
    box.renderer.setPixelRatio(window.devicePixelRatio || 1.0)
  })

  box.renderer.setSize(window.innerWidth, window.innerHeight)
  box.renderer.setPixelRatio(window.devicePixelRatio || 1.0)

  document.body.appendChild(box.renderer.domElement);
  document.body.style.cssText = 'margin: 0px; padding: 0px;'
  box.scene = new Scene()

  box.onLoop(() => {
    box.renderer.render(box.scene, box.camera)
  })
}