import { getID } from '../../FSCompiler'

var path = require('path')
let exporter = []

async function importAll (r) {
  r.keys().forEach(key => {
    console.log(key)
    let config = {
      path: key,
      _id: getID(),
      type: 'file',
      src: r(key).default
    }
    if (key === './spec.js') {
      config.isEntry = true
      config.isPackageEntry = true
    }

    if (key === './iframe.js') {
      config.isEntry = true
      config.isPreviewEntry = true
    }

    if (key === './monitor.js') {
      config.isEntry = true
      config.isMonitorEntry = true
    }
    exporter.push(config)
    // let filename = path.basename(key).replace('.glsl', '')
    // exporter[filename] = r(key)
  })

  return exporter
}

// importAll(require.context('~/components/Pages', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('!raw-loader!./src/', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('!raw-loader!./src/', true, /\.js$/, 'sync'), 'sync')
importAll(require.context('!raw-loader!./src/', true, /\.glsl$/, 'sync'), 'sync')
importAll(require.context('!raw-loader!./src/', true, /\.vert$/, 'sync'), 'sync')
importAll(require.context('!raw-loader!./src/', true, /\.frag$/, 'sync'), 'sync')


export default exporter
