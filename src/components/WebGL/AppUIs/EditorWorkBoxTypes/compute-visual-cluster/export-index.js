
// export default as { Files } from
import fileTree from './loadFiles.js'
import coverImage from './img/thumb.svg'
import { getID } from '../../EditorSpace/ageUI.js'
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


/*


*/

const guiData = {
  compute: glsl`

#ifdef IS_VERTEX
vec4 computeVertex () {

  vUv = uv;

  vec4 pos = texture2D(vertexTexture, uv);
  return pos;
}
#endif

#ifdef IS_FRAGMENT
vec4 computeFragment () {
  vec4 outputColor = vec4(1.0);

  vec4 meta = texture2D(indexTexture, vUv);

  // meta exaplain
  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float pointIDX = meta.w;

  // planes
  float dimension2D = floor(pow(totalSquares, 0.5));
  // float dX2D = (squareIDX / dimension2D) * 2.0 - dimension2D;
  // float dY2D = (mod(squareIDX, dimension2D)) * 2.0 - dimension2D;

  // UV for planes & cube
  vec2 textureUV = vec2(
    floor(squareIDX / dimension2D) / dimension2D,
    (mod(squareIDX, dimension2D)) / dimension2D
  );

  vec4 texColor = texture2D(colorTexture, textureUV);

  if (length(texColor.rgb) > 0.0 || texColor.a > 0.0) {
    outputColor = texColor;
  } else {
    vec3 v_tt = normalize(vPos);
    outputColor = vec4(
      0.25 + 0.5 * abs(v_tt.x),
      0.75 + 0.5 * abs(v_tt.y),
      0.25 + 0.5 * abs(v_tt.z),
      1.0
    );
  }

  return outputColor;
}
#endif


  `,
  sizeX: 256,
  sizeY: 256
}

const compatability = {
  boxIn: [
    'texture-geometry',
    'texture-fragment'
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