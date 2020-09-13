export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, SphereBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let self = {
    mesh: false
  }
  workspaces.set(work._id, self)

  let getFirstConnectedItem = ({ work }) => {
    let itemA = work
    let arrowAB = arrows.find(e => e.to === itemA._id)
    let arrowBA = arrows.find(e => e.from === itemA._id)
    if (arrowAB) {
      let itemB = works.find(e => e._id === arrowAB.from)
      let api = workspaces.get(itemB._id)
      if (api) {
        return {
          api,
          arrowAB,
          arrowBA
        }
      } else {
        return {
          api: false,
          arrowAB: arrowAB,
          arrowBA: false
        }
      }
    } else {
      return {
        api: false,
        arrowAB: false,
        arrowBA: arrowBA
      }
    }
  }

  let tryDoRemoteWork = ({ onOK, checkCapability, work, onFail = () => {} }) => {
    let { api, arrowAB, arrowBA } = getFirstConnectedItem({ work })
    if (api && checkCapability({ api })) {
      onOK({ api, arrowAB, arrowBA })
      arrowAB.errorCode = ''
      arrowAB.errorMsg = ''
    } else if (api && !checkCapability({ api })) {
      if (arrowAB) {
        arrowAB.errorCode = 'api.replaceGeometry'
        arrowAB.errorMsg = 'api.replaceGeometry method is not found'
        console.error(arrowAB.errorMsg)
        onFail()
      }
    } else {
      if (arrowBA) {
        arrowBA.errorCode = 'Wrong direction, api is not found'
        arrowBA.errorMsg = 'Wrong direction, api is not found'
        console.error(arrowBA.errorMsg)
        onFail()
      }
    }
  }

  tryDoRemoteWork({
    work,
    checkCapability: ({ api }) => {
      return [api.replaceGeometry].filter(e => typeof e !== 'undefined').length > 0
    },
    onOK: ({ api }) => {
      api.replaceGeometry({ geometry: new SphereBufferGeometry(60, 36, 36) })
    },
    onFail: () => {

    }
  })

  // let { api, arrowAB, arrowBA } = getFirstConnectedItem({ work })
  // if (api && api.replaceGeometry) {
  //   api.replaceGeometry({ geometry: new SphereBufferGeometry(60, 36, 36) })
  //   arrowAB.errorCode = ''
  //   arrowAB.errorMsg = ''
  // } else if (api && !api.replaceGeometry) {
  //   if (arrowAB) {
  //     arrowAB.errorCode = 'api.replaceGeometry'
  //     arrowAB.errorMsg = 'api.replaceGeometry method is not found'
  //     console.error(arrowAB.errorMsg)
  //   }
  // } else {
  //   if (arrowBA) {
  //     arrowBA.errorCode = 'Wrong direction, api is not found'
  //     arrowBA.errorMsg = 'Wrong direction, api is not found'
  //     console.error(arrowBA.errorMsg)
  //   }
  // }

  // let geo = new BoxBufferGeometry(100, 100, 100, 5, 5, 5)
  // let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#ffba00') })
  // self.mesh = new Mesh(geo, mat)
  // box.scene.add(self.mesh)

  // console.log('context of run time', self.mesh, box, works, arrows)
  // box.scene.background = new Color('#ffba00')
}
