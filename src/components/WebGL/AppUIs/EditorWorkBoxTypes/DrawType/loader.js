import { getID } from '../../FSCompiler'

var path = require('path')
let exporter = []

async function importAll (r) {
  r.keys().forEach(key => {
    console.log(key)
    let config = {
      type: path.dirname(key),
      module: r(key).default,
      path: key,
      _id: getID()
    }

    exporter.push(config)
    // let filename = path.basename(key).replace('.glsl', '')
    // exporter[filename] = r(key)
  })

  return exporter
}

// importAll(require.context('~/components/Pages', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('!raw-loader!./', true, /export-index\.js$/, 'sync'), 'sync')

console.log(exporter)

export default exporter
