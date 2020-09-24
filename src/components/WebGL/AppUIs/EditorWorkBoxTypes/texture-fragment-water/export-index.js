
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

// Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
// :)
// by David Hoskins.


// Water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07


// Redefine below to see the tiling...
//#define SHOW_TILING

#define TAU 6.28318530718
#define MAX_ITER 35

vec4 waterwaves( in vec2 fragCoord, in vec2 iResolution, in float iTime)
{
  float time = iTime * .5+23.0;
    // uv should be the 0-1 uv of texture...
  vec2 uv = fragCoord.xy / iResolution.xy;

#ifdef SHOW_TILING
  vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
#else
    vec2 p = mod(uv*TAU, TAU)-250.0;
#endif
  vec2 i = vec2(p);
  float c = 1.0;
  float inten = .005;

  for (int n = 0; n < MAX_ITER; n++)
  {
    float t = time * (1.0 - (3.5 / float(n+1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
  }
  c /= float(MAX_ITER);
  c = 1.17-pow(c, 1.4);
  vec3 colour = vec3(pow(abs(c), 8.0));
    colour = clamp(colour + vec3(0.0, 0.35, 0.5), 0.0, 1.0);


  #ifdef SHOW_TILING
  // Flash tile borders...
  vec2 pixel = 2.0 / iResolution.xy;
  uv *= 2.0;

  float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
  vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
  uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
  colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line

  #endif
  return vec4(colour, 1.0);
}

void compute (inout vec4 nextColor, inout vec4 lastColor, in vec4 addonColor) {
  if (length(addonColor.rgb) > 0.0) {
    nextColor = waterwaves(vUv * 1024.0, vec2(1024.0), time) * addonColor;
  } else {
    nextColor = waterwaves(vUv * 1024.0, vec2(1024.0), time);
  }
  nextColor.a = 0.75;
}

  `,
  sizeX: 128,
  sizeY: 128
}

const compatability = {
  boxIn: [
    'texture-fragment'
  ],
  boxOut: [
    'remixable-shader-material'
  ]
}

const displayName = 'Fragment Water'

const tags = [
  'texture',
  'texture-fragment',
  'compute-texture-fragment'
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