export const use = async ({ box, work, works, arrows }) => {
  let { Color, Points, PlaneBufferGeometry, ShaderMaterial } = box.deps.THREE
  let { workspaces } = box
  let api = {
    replaceGeometry: ({ geometry }) => {
      api.drawItem.geometry = geometry
      geometry.needsUpdate = true
    },
    replaceMaterial: ({ material }) => {
      api.drawItem.material = material
      if (material.defines) {
        material.defines.USE_POINTS = 'true'
      }
      material.needsUpdate = true
    },
    replaceDrawItem: ({ drawItem }) => {
      box.scene.remove(api.drawItem)
      api.drawItem = drawItem
      box.scene.add(api.drawItem)
    },
    drawItem: false
  }

  workspaces.set(work._id, api)

  let mat = new ShaderMaterial({
    transparent: true,
    vertexShader: `
      void main (void) {
        gl_PointSize = 5.0;
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

  let geo = new PlaneBufferGeometry(120, 120, 30, 30)
  // let mat = new PointsMaterial({ size: 2, color: new Color('#bebebe') })
  api.drawItem = new Points(geo, mat)
  box.scene.add(api.drawItem)

  // console.log('context of run time', api.drawItem, box, works, arrows)
  // box.scene.background = new Color('#ffba00')
}
