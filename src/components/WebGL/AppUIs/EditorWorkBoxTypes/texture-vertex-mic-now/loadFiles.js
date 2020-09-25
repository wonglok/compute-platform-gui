import { getID } from '../../../Core/O3DNode'
import { flatToTree } from '../../../Packages/FSCompiler/FSCompiler'

var path = require('path')
let exporter = []

async function importAll (r) {
  r.keys().forEach(key => {
    // console.log(key)

    let config = {
      path: key,
      _id: getID(),
      type: 'file',
      src: r(key).default
    }

    if (key === './work/work.js') {
      config.isEntry = true
      config.isPackageEntry = true
    }

    // if (key === './monitor/Pipeline.js') {
    //   config.isPipeline = true
    //   config.src = require('!raw-loader!../CodeShared/Pipeline.js').default
    // }

    // if (key === './iframe.js') {
    //   config.isEntry = true
    //   config.isPreviewEntry = true
    // }

    if (key === './monitor/monitor.js') {
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

exporter.push({
  path: './util/util.js',
  _id: getID(),
  type: 'file',
  src: require('!raw-loader!../util/util.js').default
})


exporter.forEach(f => {
  var dir = path.dirname(f.path)
  if (!exporter.map(e => e.path).includes(dir) && dir !== '.') {
    exporter.push({
      path: dir,
      isExpanded: true,
      type: 'folder'
    })
  }
})

exporter = JSON.parse(JSON.stringify(flatToTree(exporter)))

export default exporter
