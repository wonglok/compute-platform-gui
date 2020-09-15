export const use = ({ box, work }) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { PointsMaterial, Points, PlaneBufferGeometry, ShaderMaterial, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box
  // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  // let directionaLight = new PointLight(0xffffff, 1, 1500, 2)
  // directionaLight.position.x = 300
  // directionaLight.position.y = 300
  // directionaLight.position.z = 300
  // scene.add(directionaLight)

  let geo = new PlaneBufferGeometry(200, 200, 10, 10)
  let mat = new ShaderMaterial({
    vertexShader: `
      void main (void) {
        gl_PointSize = 10.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      void main (void) {
        if (length(gl_PointCoord.xy - 0.5) <= 0.5) {
          gl_FragColor = vec4(vec3(0.5), 1.0);
        } else {
          discard;
        }
      }
    `
  })

  let mesh = new Points(geo, mat)

  camera.position.z = 150
  scene.background = new Color('#ffffff')

  box.onLoop(() => {
    let time = window.performance.now() * 0.001
    mesh.position.z = Math.sin(time * 3.3333) * 50.0
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