export const use = ({ box, work }) => {
  // if (box && box.userData && box.userData.work && box.userData.work.coverImage) {
  let { PointsMaterial, Points, PlaneBufferGeometry, TextureLoader, Color, DoubleSide } = box.deps.THREE
  let { scene, camera } = box
  // let texture = new TextureLoader().load(box.userData.work.coverImage)
  // let mat = new MeshBasicMaterial({ map: texture, color: new Color('#ffffff'), side: DoubleSide })
  // let geo = new PlaneBufferGeometry(170, 170, 2, 2)

  // let directionaLight = new PointLight(0xffffff, 1, 1500, 2)
  // directionaLight.position.x = 300
  // directionaLight.position.y = 300
  // directionaLight.position.z = 300
  // scene.add(directionaLight)
  let dataURI = `data:image/svg+xml,`
  let svgSrc = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="186px" height="186px" viewBox="0 0 186 186" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <title>Oval</title>
      <defs>
          <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" r="51.0963622%" id="radialGradient-1">
              <stop stop-color="#A6A6A6" offset="0%"></stop>
              <stop stop-color="#D4D4D4" stop-opacity="0" offset="100%"></stop>
          </radialGradient>
      </defs>
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="Desktop" transform="translate(-430.000000, -245.000000)" fill="url(#radialGradient-1)">
              <circle id="Oval" cx="523" cy="338" r="93"></circle>
          </g>
      </g>
  </svg>`
  let svgURL = `${dataURI}${encodeURIComponent(svgSrc)}`
  let texture = new TextureLoader().load(svgURL)
  let geo = new PlaneBufferGeometry(200, 200, 10, 10)
  let mat = new PointsMaterial({ size: 3, color: new Color('#bebebe'), map: texture, transparent: true })
  let mesh = new Points(geo, mat)

  camera.position.z = 150
  scene.background = new Color('#ffffff')

  box.onLoop(() => {
    mesh.rotation.z += 0.01
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