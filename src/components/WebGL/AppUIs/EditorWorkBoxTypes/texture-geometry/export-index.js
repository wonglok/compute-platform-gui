
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
  influenceType: 'vertex',

  compute: glsl`

vec4 toPlanes (vec4 meta) {
  //  ------- setup code -------
  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float pointIDX = meta.w;

  vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);
  vec3 plane = vec3(1.0, 1.0, 1.0);

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
  }

  return pos;
}

vec4 toCubeCluster (vec4 meta, vec4 pos) {
  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float pointIDX = meta.w;

  // Cube
  float dimension3D = floor(pow(totalSquares, 1.0 / 3.0));
  float dX3D = mod(abs(squareIDX / pow(dimension3D, 0.0)), dimension3D) - dimension3D * 0.5;
  float dY3D = mod(abs(squareIDX / pow(dimension3D, 1.0)), dimension3D) - dimension3D * 0.5;
  float dZ3D = mod(abs(squareIDX / pow(dimension3D, 2.0)), dimension3D) - dimension3D * 0.5;

  float gapper = 1.0;

  pos.x *= 0.01;
  pos.y *= 0.01;
  pos.z *= 0.0;

  pos.x += dX3D * gapper;
  pos.y += dY3D * gapper;
  pos.z += dZ3D * gapper;

  pos.xyz *= 8.0;

  return pos;
}

vec4 toSurfaceCluster (vec4 meta, vec4 pos) {
  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float pointIDX = meta.w;

  // planes
  float dimension2D = floor(pow(totalSquares, 0.5));
  float dX2D = (squareIDX / dimension2D) * 2.0 - dimension2D;
  float dY2D = (mod(squareIDX, dimension2D)) * 2.0 - dimension2D;

  float gapper = 0.15;

  pos.x *= 0.15;
  pos.y *= 0.15;
  pos.z *= 0.0;

  pos.x += dX2D * gapper;
  pos.y += dY2D * gapper;

  pos.xyz *= 8.0;

  return pos;
}

vec4 compute () {
  vec2 sec = 1.0 / resolution.xy;
  vec2 uv = gl_FragCoord.xy * sec;

  vec4 meta = texture2D(indexTexture, vec2(uv.x, uv.y));
  vec4 lastFrame = texture2D( passThruTexture, vec2(uv.x, uv.y) );


  float vertexIDX = meta.x;
  float squareIDX = meta.y;
  float totalSquares = meta.z;
  float dimension2D = floor(pow(totalSquares, 0.5));
  // UV for planes & cube
  vec2 tv = vec2(
    (squareIDX / dimension2D) / dimension2D,
    (mod(squareIDX, dimension2D)) / dimension2D
  );
  vec4 realtimeMicColor = texture2D( realtimeMicTexture, vec2(tv.x, tv.y) );
  vec4 recordedMicColor = texture2D( recordedMicTexture, vec2(tv.x, tv.y) );
  vec4 addonColor = texture2D( addonTexture, vec2(tv.x, tv.y) );

  vec4 nextColor = lastFrame;

  vec4 pos = toPlanes(meta);
  vec4 cluster = toCubeCluster(meta, pos);

  cluster.rgb = ballify(cluster.rgb, 50.0 + 50.0 * realtimeMicColor.r + 50.0 * recordedMicColor.r);

  float pX = pos.x;
  float pY = pos.y;
  float pZ = pos.z;
  float piz = 0.005 * 2.0 * 3.14159265;

  cluster.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateZ(time + pY * piz) * cluster.xyz;
  cluster.xyz = rotateQ(normalize(vec3(1.0, pX * piz, 1.0)), time + pX * piz) * rotateX(time + pY * piz) * cluster.xyz;

  nextColor.rgb = cluster.rgb;

  nextColor.a = 1.0;

  return nextColor;
}


  `,
  sizeX: 256,
  sizeY: 256,
  refresher: 0
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

const displayName = 'Texture Geometry'

const tags = [
  'texture-geometry'
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

const needsMic = true

export {
  needsMic,
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