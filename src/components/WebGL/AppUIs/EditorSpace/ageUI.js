/**
 * Copyright 2019 WONG LOK

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export const boxColorTypes = {
  'grey': `linear-gradient(251deg, #ccc 9%, #b1b1b1 100%)`,

  'purple': `linear-gradient(251deg, rgba(214, 192, 255, 0.72) 9%, rgb(133, 27, 255) 100%)`,
  'fragment': `linear-gradient(251deg, rgba(214, 192, 255, 0.72) 9%, rgb(133, 27, 255) 100%)`,
  blue: `linear-gradient(251deg, rgba(192,223,255,0.72) 9%, #1B86FF 100%)`,
  vertexinput: `linear-gradient(251deg, rgba(192,223,255,0.72) 9%, #1B86FF 100%)`,
  output: `linear-gradient(251deg, rgba(192,223,255,0.72) 9%, #1B86FF 100%)`,
  statement: `linear-gradient(251deg, rgba(192,223,255,0.72) 9%, #1B86FF 100%)`,
  uniform: `linear-gradient(251deg, rgba(192,223,255,0.72) 9%, #1B86FF 100%)`,
  'texture-reader': `linear-gradient(251deg, rgba(255,192,192,0.72) 9%, #FF1B1B 100%)`,
  attribute: `linear-gradient(251deg, rgba(255,192,192,0.72) 9%, #FF1B1B 100%)`,
  red: `linear-gradient(251deg, rgba(255,192,192,0.72) 9%, #FF1B1B 100%)`,
  yellow: `linear-gradient(251deg, rgba(255,221,192,0.72) 9%, #FF881B 100%)`,
  default: `linear-gradient(251deg, rgba(255,221,192,0.72) 9%, #FF881B 100%)`,
  'preview-box': `linear-gradient(251deg, rgba(255,221,192,0.72) 9%, #FF881B 100%)`,
  'custom-function': `linear-gradient(251deg, rgba(255, 192, 250, 0.72) 9%, rgb(27, 234, 255) 100%)`,
  function: `linear-gradient(251deg, rgba(192,255,210,0.72) 9%, #18CA1A 100%)`,
  green: `linear-gradient(251deg, rgba(192,255,210,0.72) 9%, #18CA1A 100%)`
}

export const getID = () => {
  return `_${Number(100000000 * Math.random()).toFixed(0)}_`
}

export const getDOM = ({ domID }) => {
  return new Promise((resolve) => {
    let tout = 0
    tout = setInterval(() => {
      let val = document.getElementById(domID)
      if (val) {
        resolve(val)
        clearTimeout(tout)
      }
    })
  })
}

export const getIO = (args) => {
  return {
    ...args,
    _id: getID()
  }
}

export const getWin = (config = {}, pos = {}, data = {}) => {
  let isMin = window.innerWidth <= 767
  let margin = isMin ? 0 : 15
  let vmin = Math.min(window.innerWidth, window.innerHeight)
  let winTopGap = isMin ? vmin / 2 : 0
  let width = window.innerWidth - 270 * 1 - margin - margin - margin
  if (isMin) {
    width = window.innerWidth
  }
  let out = {
    _id: getID(),
    title: '',
    type: 'custom-function',
    order: 0,
    pos: {
      x: window.innerWidth - width - margin,
      y: margin + winTopGap,
      w: width,
      h: window.innerHeight - margin * 2 - winTopGap,
      s: 1,
      ...pos
    },
    show: true,
    appName: 'editor',
    inputs: [
    ],
    outputs: [
    ],
    spread: [],
    declare: '',
    func: '',
    eval: '',
    resize: true,
    isRoot: false,
    shaderType: '',
    ...config,
    data
  }
  if (window.innerWidth <= 500 && window.innerHeight > window.innerWidth) {
    // out.pos.x = 15
    out.pos.w = window.innerWidth
  }
  return out
}

export const focusWinsOfApp = ({ wins, appName }) => {
  wins.filter(t => t.appName === appName).forEach((win) => focusApp({ wins, win }))
}

export const focusApp = ({ wins, win }) => {
  wins.order = (t) => {
    t.order = 0
  }
  win.order = 100
  wins.sort((a, b) => {
    if (a.order > b.order) {
      return 1
    } else if (a.order < b.order) {
      return -1
    } else {
      return 0
    }
  })
  win.order = 0
}

export const makeDrag = ({ dom, onMM = () => {}, onDown = () => {}, onUp = () => {} }) => {
  let mod = {
    dom,
    down: false,
    tsX: 0,
    tsY: 0,
    dX: 0,
    dY: 0,
    aX: 0,
    aY: 0,
    pageX: 0,
    pageY: 0,
    target: false,
    onTS: (ev) => {
      let touch = ev.touches[0]
      mod.tsX = touch.pageX
      mod.tsY = touch.pageY
      mod.down = true
      onDown({ api: mod, ev })
    },
    onTM: (ev) => {
      if (mod.down) {
        try {
          ev.preventDefault()
        } catch (e) {
          console.log(e)
        }

        let touch = ev.touches[0]
        mod.dX = touch.pageX - mod.tsX
        mod.dY = touch.pageY - mod.tsY

        mod.aX += mod.dX
        mod.aY += mod.dY

        mod.tsX = touch.pageX
        mod.tsY = touch.pageY

        mod.pageX = touch.pageX
        mod.pageY = touch.pageY

        mod.target = touch.target

        onMM({ api: mod, ev })
      }
    },
    onTE: (ev) => {
      mod.down = false
    },
    onUp: (ev) => {
      onUp({ api: mod, ev })
    },
    onMD: (ev) => {
      mod.tsX = ev.pageX
      mod.tsY = ev.pageY
      mod.down = true
      onDown({ api: mod, ev })
    },
    onMM: (ev) => {
      if (mod.down) {
        mod.dX = ev.pageX - mod.tsX
        mod.dY = ev.pageY - mod.tsY

        mod.aX += mod.dX
        mod.aY += mod.dY

        mod.tsX = ev.pageX
        mod.tsY = ev.pageY

        mod.pageX = ev.pageX
        mod.pageY = ev.pageY

        mod.target = ev.target

        onMM({ api: mod, ev })
      }
    },
    onMU: (ev) => {
      mod.down = false
    }
  }
  window.addEventListener('mouseup', mod.onUp, { passive: false })
  window.addEventListener('touchend', mod.onUp, { passive: false })
  // window.addEventListener('touchcancel', mod.onUp, { passive: false })

  mod.dom.addEventListener('mouseup', mod.onUp, { passive: false })
  mod.dom.addEventListener('touchend', mod.onUp, { passive: false })
  // mod.dom.addEventListener('touchcancel', mod.onUp, { passive: false })

  mod.dom.addEventListener('mousedown', mod.onMD, { passive: false })
  mod.dom.addEventListener('mousemove', mod.onMM, { passive: false })
  mod.dom.addEventListener('mouseup', mod.onMU, { passive: false })

  window.addEventListener('mousemove', mod.onMM, { passive: false })
  window.addEventListener('mouseup', mod.onMU, { passive: false })

  mod.dom.addEventListener('touchstart', mod.onTS, { passive: false })
  mod.dom.addEventListener('touchmove', mod.onTM, { passive: false })
  mod.dom.addEventListener('touchend', mod.onTE, { passive: false })
  mod.dom.addEventListener('touchcancel', mod.onTE, { passive: false })
  window.addEventListener('touchmove', mod.onTM, { passive: false })
  window.addEventListener('touchend', mod.onTE, { passive: false })
  window.addEventListener('touchcancel', mod.onTE, { passive: false })
}

// export const DnDFactory = () => {
// /*
// <template>
//   <div class="dndot" @click="onClick()" v-if="userdata" v-dragme v-dropme :userdata="userdata" :drop="onDrop">
//     123123
//   </div>
// </template>

// <script>
// import * as AGE from '../api/age'
// let directive = AGE.DnDFactory()()

// export default {
//   props: {
//     userdata: {}
//   },
//   directives: {
//     ...directive
//   },
//   data () {
//     return {
//     }
//   },
//   methods: {
//     onClick () {
//       console.log(this.userdata)
//     },
//     onDrop (v) {
//       console.log(v)
//     }
//   }
// }
// </script>

// <style>

// </style>
//   */
//   let hand = new Vue({})
//   let indicator = document.createElement('div')
//   indicator.style.display = 'none'
//   document.body.appendChild(indicator)

//   return () => {
//     let mod = {
//       dragme: {
//         // When the bound element is bind into the DOM...
//         bind (el, binding, vnode) {
//           let data = vnode.data.attrs.userdata
//           console.log(data)
//           // Focus the element
//           // el.omg()
//           let sent = false
//           makeDrag({
//             dom: el,
//             onDown: ({ api }) => {
//               sent = false
//               indicator.style.display = 'block'
//               indicator.style.opacity = '0'
//               indicator.style.transform = `translate3d(${api.pageX}px, ${30 + api.pageY}px, 0px)`
//               indicator.style.backgroundColor = 'white'
//               indicator.style.zIndex = '100000000'
//               indicator.style.position = 'fixed'
//               indicator.style.top = '0'
//               indicator.style.left = '0'
//               indicator.style.fontFamily = `'Avenir', Helvetica, Arial, sans-serif`
//               indicator.style.padding = '10px'
//               indicator.style.borderRadius = '10px'
//               indicator.style.boxShadow = `0px 0px 10px 0px grey`
//               indicator.innerText = data.label || ''
//               indicator.style.transition = ''
//               indicator.style.userSelect = 'none'
//             },
//             onMM: ({ api }) => {
//               indicator.style.opacity = '1'
//               indicator.style.transform = `translate3d(${api.pageX}px, ${30 + api.pageY}px, 0px)`
//               let rect = indicator.getBoundingClientRect()

//               let hoverAt = document.elementFromPoint(api.pageX, api.pageY)
//               if (hoverAt) {
//                 let json = hoverAt.getAttribute('json')
//                 if (json) {
//                   try {
//                     json = JSON.parse(json)
//                   } catch (e) {
//                     json = false
//                   }
//                 } else {
//                   json = false
//                 }
//                 if (json && JSON.stringify(json) !== JSON.stringify(data) && json._id !== data._id) {
//                   indicator.style.backgroundColor = 'lime'
//                   hand.canDrop = true
//                 } else {
//                   indicator.style.backgroundColor = 'white'
//                   hand.canDrop = false
//                 }
//               }

//               hand.x = rect.left - 30
//               hand.y = rect.top - 30
//               hand.data = data
//             },
//             onUp: ({ api, ev }) => {
//               indicator.display = 'none'
//               let hoverAt = document.elementFromPoint(api.pageX, api.pageY)
//               indicator.style.opacity = '0'
//               indicator.style.transform = ''
//               indicator.style.userSelect = ''
//               if (!sent && hand.canDrop) {
//                 hand.$emit('send', { hoverAt, handdata: data })
//                 sent = true
//               }
//             }
//           })
//         }
//       },
//       dropme: {
//         // When the bound element is bind into the DOM...
//         bind (el, binding, vnode) {
//           let dropHandler = vnode.data.attrs.drop || (() => {})
//           let userdata = vnode.data.attrs.userdata
//           el.setAttribute('json', JSON.stringify(userdata))

//           hand.$on('send', ({ hoverAt, handdata }) => {
//             if (hoverAt === el || el.contains(hoverAt) || hoverAt.contains(el)) {
//               if (JSON.stringify(handdata) !== JSON.stringify(userdata)) {
//                 console.log('-----found dropzone')
//                 console.log('-----drop data', userdata)
//                 console.log('-----hand data', handdata)
//                 dropHandler({ hand: handdata, land: userdata })
//               }
//             }
//           })

//           // el.addEventListener('mouseover', () => {
//           //   let rect = el.getBoundingClientRect()
//           //   let { x, y } = hand
//           //   console.log(el)

//           //   if (x >= rect.left && x <= (rect.left + rect.width) && y <= (rect.top + rect.height) && y >= rect.top) {
//           //     dropHandler({ hand: hand.data, land: userdata })
//           //   }
//           //   console.log(x >= rect.left, x <= (rect.left + rect.width), y <= (rect.top + rect.height), y >= rect.top)
//           // })
//         }
//       }
//     }
//     return mod
//   }
// }
