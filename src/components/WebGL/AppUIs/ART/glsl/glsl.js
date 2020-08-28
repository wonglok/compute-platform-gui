
var path = require('path')
let exporter = {
}

async function importAll (r) {
  r.keys().forEach(key => {
    let filename = path.basename(key).replace('.glsl', '')
    exporter[filename] = r(key)
  })
  return exporter
}

// importAll(require.context('~/components/Pages', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('raw-loader!./', true, /\.glsl$/, 'sync'), 'sync')

export default exporter
