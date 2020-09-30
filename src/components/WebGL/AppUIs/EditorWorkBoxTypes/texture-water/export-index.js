
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
  influenceType: 'fragment',

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
  vec2 first = step(pixel, uv) * f;			// Rule out first screen pixels and flash.
  uv  = step(fract(uv), pixel);				  // Add one line of pixels per tile.
  colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line

  #endif
  return vec4(colour, 1.0);
}

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

  vec4 color = waterwaves(vUv * 1024.0 + addonColor.rg * 1024.0, vec2(1024.0), time);

  nextColor = color;
  // if (length(addonColor.rgb) != 0.0 || addonColor.a != 0.0){
  //   nextColor *= addonColor;
  // }

  return nextColor;
}

  `,
  sizeX: 512,
  sizeY: 512,
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

const displayName = 'Water'

const tags = [
  'texture-fragment',
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