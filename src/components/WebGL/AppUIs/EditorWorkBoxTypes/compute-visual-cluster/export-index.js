// export default as { Files } from
import fileTree from './loadFiles.js'
import coverImage from './img/thumb.svg'
import { getID } from '../../../Core/O3DNode.js'
// import { getID } from '../../../Core/O3DNode.js'
// import { EventDispatcher } from 'three'
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

const needsMic = true

const workBoxFrameColor = '#98ddd6'
const workBoxScreenColor = '#ffffff'

const io = {
  inputs: [],
  outputs: []
}

const guiData = {
  config: {
    "WIDTH": 32,
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
            "_id": "__dist_1",
            "value": "0.0",
            "display": "Cube Distribution"
          },
          {
            "_id": "__dist_2",
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
        "value": 2
      },
      {
        "name": "faceSize",
        "type": "float",
        "updater": "slider",
        "needsAuhtorises": false,
        "value": 0.15
      }
    ],
    "vertexBlockersCode": "",
    "fragmentBlockersCode": "",

    "varyingsStr": "varying highp vec3 vPos;\nvarying vec2 vUv;",
    "vertexMain": glsl`
/*
  LIBRARY
*/
#include <common>

void main (void) {
  vUv = uv;

  float vertexIDX = meta.x;
  float unitIDX = meta.y;
  float totalUnits = meta.z;
  float pointIDX = meta.w;
  vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);

  /*
    Assemble
  */

  vec3 plane = vec3(1.0, 1.0, 0.0);
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

  float uvDimension = ceil(pow(totalUnits, 0.5));
  vUv.x = (unitIDX / uvDimension) / uvDimension;
  vUv.y = (mod(unitIDX, uvDimension)) / uvDimension;
  vec4 historySound = texture2D(mic, vUv);
  vec4 currentSound = texture2D(micNow, vUv);

  vec4 past = texture2D(mic, vec2(1.0 - vUv.y, vUv.y));
  vec4 now = texture2D(micNow, vec2(vUv.y, vUv.x));

  float dimension3D = (pow(totalUnits, 1.0 / 3.0));

  float d3X = mod(abs(unitIDX / pow(dimension3D, 0.0)), dimension3D) - dimension3D * 0.5;
  float d3Y = mod(abs(unitIDX / pow(dimension3D, 1.0)), dimension3D) - dimension3D * 0.5;
  float d3Z = mod(abs(unitIDX / pow(dimension3D, 2.0)), dimension3D) - dimension3D * 0.5;

  float dimension2D = ceil(pow(totalUnits, 0.5));
  float d2X = (unitIDX / dimension2D) * 2.0 - dimension2D;
  float d2Y = (mod(unitIDX, dimension2D)) * 2.0 - dimension2D;

  float gapper = 1.5;
  #ifdef DEF_faceDistribution
    gapper = faceDistribution;
  #endif

  #ifdef DEF_faceSize
    pos.x *= faceSize;
    pos.y *= faceSize;
  #else
    pos.x *= 0.1;
    pos.y *= 0.1;
  #endif

  #ifdef DEF_distributionMode
    if (distributionMode == 0.0) {
      pos.x += d3X * gapper;
      pos.y += d3Y * gapper;
      pos.z += d3Z * gapper;
    } else if (distributionMode == 1.0) {
      pos.x += d2X * gapper;
      pos.y += d2Y * gapper;
      pos.z += 0.0;
    }
  #else
    pos.x += d3X * gapper;
    pos.y += d3Y * gapper;
    pos.z += d3Z * gapper;
  #endif

  pos.xyz *= 4.0 + currentSound.r;

  // float r1 = rand(vec2(d3X)) - 0.5;
  // float r2 = rand(vec2(d3Y)) - 0.5;
  // float r3 = rand(vec2(d3Z)) - 0.5;
  // pos += vec4(vec3(r1, r2, r3) * 30.0, 0.0);

  // float az = 0.0;
  // float el = 0.0;
  // toBall(pos.xyz, az, el);
  // pos.xyz = fromBall(60.0 + (currentSound.r + historySound.r) * 0.5 * 22.8, az, el);

  // float pX = pos.x;
  // float pY = pos.y;
  // float pZ = pos.z;
  // float piz = 0.005 * 2.0 * 3.14159265;

  // pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;

  vec4 starterPosition = pos;
  vec4 finalPosition = pos;

  /* INSERT_REMIX_CODE */

  if (isInvalid) {
    pos.xyzw = vec4(0.0);
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition);
  vPos = pos.xyz;
}
    `,

    "fragmentMain": glsl`
/*
  LIBRARY
*/
#include <common>

void main (void) {
  vec4 sound = texture2D(mic, vUv);
  vec3 v_tt = normalize(vPos);

  vec4 dataOutput = vec4(
    sound.r * 0.25 + abs(v_tt.x),
    sound.r * 0.75 + abs(v_tt.y),
    sound.r * 0.25 + abs(v_tt.z),
    0.8
  );
  // dataOutput = vec4(0.5, 0.5, 0.5, 1.0);
  vec4 defaultColor = dataOutput;

  /* INSERT_REMIX_CODE */

  gl_FragColor = dataOutput;
}
    `
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