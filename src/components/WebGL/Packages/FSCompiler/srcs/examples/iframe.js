import * as Util from './iframe/util.js'
import * as Monitor from './monitor/monitor.js'
import * as IFrame from './iframe/iframe.js'
import { MiniBoxEngine } from './monitor/MiniBoxEngine.js'

Promise.resolve()
  .then(async () => {
    let THREE = await Util.singleCachedImport('https://unpkg.com/three@0.119.1/build/three.module.js')

    let miniBox = new MiniBoxEngine()

    await IFrame.prepareRuntime({ miniBox, THREE })

    miniBox.deps = {
      THREE
    }

    Monitor.use(miniBox)
  })
