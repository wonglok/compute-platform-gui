
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

const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

float noise(in vec2 p) {
  return sin(p.x)*sin(p.y);
}

float fbm4( vec2 p ) {
    float f = 0.0;
    f += 0.5000 * noise( p ); p = m * p * 2.02;
    f += 0.2500 * noise( p ); p = m * p * 2.03;
    f += 0.1250 * noise( p ); p = m * p * 2.01;
    f += 0.0625 * noise( p );
    return f / 0.9375;
}

float fbm6( vec2 p ) {
    float f = 0.0;
    f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
    f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
    f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
    f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
    f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;
    f += 0.015625*(0.5+0.5*noise( p ));
    return f/0.96875;
}

float pattern (vec2 p, float time) {
  float vout = fbm4(p + time + fbm6( p + fbm4( p + time )));
  return abs(vout);
}


vec4 compute () {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec2 cc = vec2(
    mod(time * 0.1 + uv.x, 1.0),
    mod(time * 0.1 + uv.y, 1.0)
  );

  vec4 lastFrame = texture2D( passThruTexture, vec2(uv.x, uv.y) );
  vec4 addonColor = texture2D( addonTexture, vec2(uv.x, uv.y) );
  vec4 realtimeMicColor = texture2D( realtimeMicTexture, vec2(uv.x, uv.y) );
  vec4 recordedMicColor = texture2D( recordedMicTexture, vec2(uv.x, uv.y) );
  vec4 nextColor = lastFrame;

  vec4 color = vec4(
    pattern(vec2(vUv * (2.0 + 5.0 * recordedMicColor.r) + time * 0.15) + -0.4 * cos(time * 0.15), time),
    pattern(vec2(vUv * (2.0 + 5.0 * recordedMicColor.r) + time * 0.15) + 0.0 * cos(time * 0.15), time),
    pattern(vec2(vUv * (2.0 + 5.0 * recordedMicColor.r) + time * 0.15) + 0.4 * cos(time * 0.15), time),
    1.0
  );

  nextColor = lastFrame * realtimeMicColor + color + recordedMicColor + addonColor;

  return nextColor;
}

  `,
  sizeX: 128,
  sizeY: 128,
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

const displayName = 'Mic'

const tags = [
  'texture-mic',
  'texture-media'
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