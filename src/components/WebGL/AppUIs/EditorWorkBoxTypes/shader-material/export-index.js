// export default as { Files } from
import fileTree from './loadFiles.js'
import coverImage from './img/thumb.svg'
import { getID } from '../../../Core/O3DNode.js'

const workBoxFrameColor = '#bababa'
const workBoxScreenColor = '#ffffff'

const io = {
  inputs: [],
  outputs: []
}

const guiData = {
  pointSize: 1.379,

  twisterX: 0.334,
  twisterY: 0.344,
  twisterZ: 0.074,

  twisterSpeedX: 0.074,
  twisterSpeedY: 0.8,
  twisterSpeedZ: 0.1,

  offsetModifier: '#9E3131',
  baseColor: '#323356',
  time: 0
}

const compatability = {
  boxIn: [
  ],
  boxOut: [
    'ballify'
  ]
}

const gui = {
  settings: 'SphereBuffereGeometryGUI'
}

const buttons = {
  tl: false,
  tr: {},
  bl: {},
  br: {
    icon: 'circle-out',
    mouseMode: 'box-out'
  },
  br2: false
  // br2: {
  //   icon: require('./img/circle-out.svg'),
  //   mouseMode: 'box-out'
  // }

  // br: {
  //   icon: require('./img/circle-out.svg'),
  //   mouseMode: 'box-out'
  // }
}

export {
  fileTree,
  coverImage,
  workBoxScreenColor,
  workBoxFrameColor,
  gui,
  guiData,
  io,
  buttons,
  compatability
}

/**
 *
 * extraUniforms: [
    {
      name: 'distributionMode',
      type: 'float',
      updater: 'select',
      options: [
        {
          _id: getID(),
          value: '0.0',
          display: 'Cube Distribution'
        },
        {
          _id: getID(),
          value: '1.0',
          display: 'Plane Distribution'
        }
      ],
      needsAuhtorises: false,
      value: '0.0'
    },
    {
      name: 'faceDistribution',
      type: 'float',
      updater: 'slider',
      needsAuhtorises: false,
      value: 3.0973
    },
    {
      name: 'faceSize',
      type: 'float',
      updater: 'slider',
      needsAuhtorises: false,
      value: 0.3084
    }
  ]
 */