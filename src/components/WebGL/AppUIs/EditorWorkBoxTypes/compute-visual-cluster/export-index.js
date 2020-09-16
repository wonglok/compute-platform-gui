// export default as { Files } from
import fileTree from './loadFiles.js'
import coverImage from './img/thumb.svg'
import { getID } from '../../../Core/O3DNode.js'
// import { getID } from '../../../Core/O3DNode.js'
// import { EventDispatcher } from 'three'

const workBoxFrameColor = '#98ddd6'
const workBoxScreenColor = '#ffffff'

const io = {
  inputs: [],
  outputs: []
}

const guiData = {
  config: {
    "WIDTH": 48,
    "extraAttrs": [
      {
        "needsUpdate": false,
        "count": 4,
        "type": "vec4",
        "name": "specialColor",
        "isDynamic": false,
        "terser": "\n//'x', 'y', 'z', 'dimension', 'totalUnits', 'unitID', 'vertexID', 'totalVetex', 'out'\n\nout.x = x - dimension * 0.5;\nout.y = y - dimension * 0.5;\nout.z = z - dimension * 0.5;\n\nout.w = 1;"
      }
    ],
    "extraUniforms": [
      {
        "name": "mic",
        "type": "sampler2D",
        "updater": "mic",
        "needsAuhtorises": true,
        "value": null
      },
      {
        "name": "micNow",
        "type": "sampler2D",
        "updater": "mic-now",
        "needsAuhtorises": true,
        "value": null
      },
      {
        "name": "distributionMode",
        "type": "float",
        "updater": "select",
        "options": [
          {
            "_id": "__asda3454a",
            "value": "0.0",
            "display": "Cube Distribution"
          },
          {
            "_id": "__afd232dsa",
            "value": "1.0",
            "display": "Plane Distribution"
          }
        ],
        "needsAuhtorises": false,
        "value": '0.0'
      },
      {
        "name": "faceDistribution",
        "type": "float",
        "updater": "slider",
        "needsAuhtorises": false,
        "value": 3.0973
      },
      {
        "name": "faceSize",
        "type": "float",
        "updater": "slider",
        "needsAuhtorises": false,
        "value": 0.3084
      }
    ],
    "vertexBlockersCode": "",
    "fragmentBlockersCode": ""
  }
}

const compatability = {
  boxIn: [
  ],
  boxOut: [
  ]
}

const gui = {
  settings: 'ComputeVisual'
}

const displayName = 'Compute Visual Mesh'

const tags = [
  'compute-visual',
  'compute-visual-cluster'
]

const buttons = {
  tl: false,
  tr: {},
  bl: {},
  br: {
    icon: 'circle-plus',
    mouseMode: 'box-in'
  },
  br2: false

  // br: {
  //   icon: require('./img/circle-out.svg'),
  //   mouseMode: 'box-out'
  // }
}

export {
  displayName,
  tags,
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