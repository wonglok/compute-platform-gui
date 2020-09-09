import * as WorkBox from './package.js'
import * as Util from './iframe/util.js'
import { VisualEngine } from './iframe/VisualEngine.js'

Promise.resolve()
.then(async () => {
  let THREE = await Util.singleCachedImport('https://unpkg.com/three@0.119.1/build/three.module.js')

  let dep = {
    THREE
  }
  let engine = new VisualEngine({ THREE, singleCachedImport: Util.singleCachedImport })
  await engine.waitForSetup()
  let visual = await WorkBox.use({
    ...dep,
    ...engine
  })
})