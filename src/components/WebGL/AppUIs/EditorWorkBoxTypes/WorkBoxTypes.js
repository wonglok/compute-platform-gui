import { getID } from '../../Core/O3DNode'

var path = require('path')
let exporter = []

async function importAll (r) {
  r.keys().forEach(key => {
    // console.log(key)
    let workBoxType = path.dirname(key).replace('./', '')
    let loadedModule = r(key)
    let config = {
      ...loadedModule,
      type: workBoxType.toLowerCase(),
      _id: getID()
    }

    exporter.push(config)

    // let filename = path.basename(key).replace('.glsl', '')
    // exporter[filename] = r(key)
  })

  return exporter
}

// importAll(require.context('~/components/Pages', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('./', true, /export-index\.js$/, 'sync'), 'sync')

console.log('imported workbox types total:', exporter.map(e => e.type).join('\n'))

export default exporter
