// export default as { Files } from
import fileTree from './loadFiles.js'

import coverImage from './img/thumb.svg'

const workBoxFrameColor = '#bababa'

const io = {
  inputs: [],
  outputs: []
}

const ui = {
  settings: {}
}

export { fileTree, coverImage, workBoxFrameColor, io, ui }