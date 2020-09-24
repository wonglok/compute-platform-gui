
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
  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float pointIDX = meta.w;
  vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);

  vec3 plane = vec3(1.0, 1.0, 1.0);
  bool isInvalid = false;

  if (vertexIDX == 0.0) {
    pos.x = 1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 1.0) {
    pos.x = -1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 2.0) {
    pos.x = -1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 3.0) {
    pos.x = 1.0 * plane.x;
    pos.y = 1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 4.0) {
    pos.x = -1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else if (vertexIDX == 5.0) {
    pos.x = 1.0 * plane.x;
    pos.y = -1.0 * plane.y;
    pos.z = 1.0 * plane.z;
  } else {
    isInvalid = true;
  }

  // cube
  float dimension3D = floor(pow(totalSquares, 1.0 / 3.0));
  float dX3D = mod(abs(squareIDX / pow(dimension3D, 0.0)), dimension3D) - dimension3D * 0.5;
  float dY3D = mod(abs(squareIDX / pow(dimension3D, 1.0)), dimension3D) - dimension3D * 0.5;
  float dZ3D = mod(abs(squareIDX / pow(dimension3D, 2.0)), dimension3D) - dimension3D * 0.5;

  // plane
  float dimension2D = floor(pow(totalSquares, 0.5));
  float dX2D = (squareIDX / dimension2D) * 2.0 - dimension2D;
  float dY2D = (mod(squareIDX, dimension2D)) * 2.0 - dimension2D;

  // uv for planes & cube
  vec2 textureUV = vec2(
    (squareIDX / dimension2D) / dimension2D,
    (mod(squareIDX, dimension2D)) / dimension2D
  );

  // ---------- Visual LOGIC ----------

  float gapper = 1.0;

  pos.x *= 0.15;
  pos.y *= 0.15;
  pos.z *= 0.0;

  pos.x += dX3D * gapper;
  pos.y += dY3D * gapper;
  pos.z += dZ3D * gapper;

  pos.xy *= 0.45;

  pos.z += dZ3D * gapper;

  float r1 = rand(vec2(dX3D)) - 0.5;
  float r2 = rand(vec2(dY3D)) - 0.5;
  float r3 = rand(vec2(dZ3D)) - 0.5;
  pos += vec4(vec3(r1, r2, r3), 0.0);

  float az = 0.0;
  float el = 0.0;
  toBall(pos.xyz, az, el);
  pos.xyz = fromBall(50.0, az, el);

  float pX = pos.x;
  float pY = pos.y;
  float pZ = pos.z;
  float piz = 0.005 * 2.0 * 3.14159265;

  pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;

  pos.w = 1.0;

  if (isInvalid) {
    pos = vec4(0.0);
  }

  return pos;
}

  `,
  sizeX: 256,
  sizeY: 256
}

const compatability = {
  boxIn: [
    'texture-fragment'
  ],
  boxOut: [
    'remixable-shader-material'
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