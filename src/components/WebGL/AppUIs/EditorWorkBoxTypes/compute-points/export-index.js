
// export default as { Files } from
import fileTree from './loadFiles.js'
import coverImage from './img/thumb.svg'
// import { getID } from '../../../Core/O3DNode.js'

let glsl = (strings, ...args) => {
  let res = ''

  strings.forEach((s, i) => {
    res += s + (args[i] || '')
  })

  res = res.split('\n').map(e => {
    return e.replace('        ', '')
  }).join('\n')

  return res
}

const workBoxFrameColor = '#bababa'
const workBoxScreenColor = '#ffffff'

const io = {
  inputs: [],
  outputs: []
}

const guiData = {
  compute: glsl`

vec4 compute () {
  vec4 result = vec4(1.0);
  vec4 texColor = texture2D(vertexTexture, uv);

  result = vec4(
    80.0 * meta.x,
    80.0 * meta.y,
    80.0 * meta.z,
    1.0
  );

  if (length(texColor.rgb) > 0.0 || texColor.a > 0.0) {
    result.rgb = (texColor.rgb) * 100.0 * vec3(
      (-0.5 + rand(0.1 + meta.xy)),
      (-0.5 + rand(0.2 + meta.xy)),
      (-0.5 + rand(0.3 + meta.xy))
    );
  }

  return result;
}

  `,
  sizeX: 256,
  sizeY: 256
}

const compatability = {
  boxIn: [
    'texture-media',
    'texture-fragment',
    'texture-vertex'
  ],
  boxOut: [
  ]
}

const displayName = 'Compute Visual Cluster'

const tags = [
  'compute-visual-cluster'
]

const gui = {
  settings: ''
}

const buttons = {
  tl: false,
  tr: {},
  bl: {},

  // br: {
  //   icon: 'circle-out',
  //   mouseMode: 'box-out'
  // },

  br: {
    icon: 'circle-plus',
    mouseMode: 'box-in'
  }

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