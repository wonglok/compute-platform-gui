import { makeMaterial } from '../shared/material.js'

export const use = async ({ box, work, works, arrows }) => {
  let { Color, Mesh, BoxBufferGeometry, SphereBufferGeometry, MeshBasicMaterial } = box.deps.THREE
  let { workspaces } = box
  let self = {
    material: false
  }

  workspaces.set(work._id, self)

  let getFirstConnectedItem = ({ work }) => {
    let itemA = work
    let arrowAB = arrows.find(e => e.from === itemA._id)
    let arrowBA = arrows.find(e => e.to === itemA._id)
    if (arrowAB) {
      let itemB = works.find(e => e._id === arrowAB.to)
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

  let connectToMesh = () => {
    let { api, arrowAB, arrowBA } = getFirstConnectedItem({ work })
    if (api && api.replaceMaterial) {
      self.material = self.material || makeMaterial({ work, box })
      self.material.needsUpdate = true

      api.replaceMaterial({ material: self.material })

      arrowAB.errorCode = ''
      arrowAB.errorMsg = ''
    } else if (api && !api.replaceMaterial) {
      if (arrowAB) {
        arrowAB.errorCode = 'API.replaceMaterial'
        arrowAB.errorMsg = 'API.replaceMaterial method is not found'
        console.error(arrowAB.errorMsg)
      }
    } else {
      if (arrowBA) {
        arrowBA.errorCode = 'API is not found'
        arrowBA.errorMsg = 'API is not found'
        console.error(arrowBA.errorMsg)
      } else if (arrowAB) {
        setTimeout(() => {
          connectToMesh()
        }, 0)
      }
    }
  }

  connectToMesh()

  // box.onRefresh(() => {
  //   connectToMesh()
  // })

  // let geo = new BoxBufferGeometry(100, 100, 100, 5, 5, 5)
  // let mat = new MeshBasicMaterial({ wireframe: true, color: new Color('#ffba00') })
  // self.mesh = new Mesh(geo, mat)
  // box.scene.add(self.mesh)

  // console.log('context of run time', self.mesh, box, works, arrows)
  // box.scene.background = new Color('#ffba00')
}
