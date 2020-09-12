import starterV from './starter/main.vert'
import starterF from './starter/main.frag'

import ball from './lib/ball.glsl'
import rotate from './lib/rotate.glsl'

export const lib = {
  ball,
  rotate
}

export const starter = {
  v: starterV,
  f: starterF
}
