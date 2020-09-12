export class RunBox {
  constructor ({ onMasterLoop }) {
    this.onMasterLoop = onMasterLoop

    this.isAborted = false
    this.tasks = []
    this.resizeTasks = []
    this.cleanTasks = []
    this.onLoop = (fnc) => {
      this.tasks.push(fnc)
    }

    this.onResize = (fnc) => {
      fnc()
      this.resizeTasks.push(fnc)
    }

    let intv = 0
    let internalResize = () => {
      clearTimeout(intv)
      intv = setTimeout(() => {
        this.resizeTasks.forEach(e => e())
      }, 16.8888)
    }

    window.addEventListener('resize', () => {
      internalResize()
    })

    this.goCleanUp = () => {
      this.isAborted = true
      try {
        this.cleanTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    this.onMasterLoop(() => {
      this.runLoop()
    })
  }
  runLoop () {
    if (this.isAborted) {
      return
    }

    try {
      this.tasks.forEach(e => e())
    } catch (e) {
      console.error(e)
    }
  }
}


// export class CoreShell {
//   constructor ({ core, vm }) {
//     this.core = core
//     this.vm = vm

//     this.last = {
//       scriptCode: ''
//     }

//     console.log(core.engineCodeTree)

//     let vueCode = this.getVueCode()

//     this.vm.dynamo = this.makeNewInstance({ vueCode })

//     this.vm.$root.$on('refresh-shell', () => {
//       let vueCode = this.getVueCode()
//       let { scriptCode } = this.processVueCode({ vueCode })
//       if (scriptCode !== this.last.scriptCode) {
//         this.vm.dynamo = this.makeNewInstance({ vueCode })
//       } else {
//         this.onRefresh({ vueCode })
//       }
//       this.last.scriptCode = scriptCode
//     })
//   }
//   getVueCode () {
//     let vueCode = this.core.engineCodeTree.children[0].src
//     return vueCode
//   }
//   compileTemplate ({ templateCode }) {
//     let templateRenderFnc = Vue.compile(templateCode)
//     return templateRenderFnc.render
//   }
//   processVueCode ({ vueCode }) {
//     let templateCode = vueCode.match(/<template>([\S\s]*?)<\/template>/gi)
//     templateCode = templateCode[0]
//     templateCode = templateCode.replace(/^<template>/, '')
//     templateCode = templateCode.replace(/<\/template>$/, '')

//     let styleCode = vueCode.match(/<style([\S\s]*?)<\/style>/gi)
//     let styleHTML = styleCode[0]

//     let scriptCode = vueCode.match(/<script>([\S\s]*?)<\/script>/gi)
//     scriptCode = scriptCode[0]
//     scriptCode = scriptCode.replace(/^<script>/, '')
//     scriptCode = scriptCode.replace(/<\/script>$/, '')

//     return {
//       templateCode,
//       styleHTML,
//       scriptCode
//     }
//   }

//   onRefresh ({ vueCode }) {
//     let { templateCode } = this.processVueCode({ vueCode })
//     if (this.vm.$refs.dynamo) {
//       this.vm.$refs.dynamo.$options.render = this.compileTemplate({ templateCode })
//       this.vm.$refs.dynamo.$forceUpdate()
//     }
//   }

//   getConfig ({ vueCode }) {
//     let { scriptCode } = this.processVueCode({ vueCode })
//     scriptCode = scriptCode.replace('export default ', 'return ')
//     let fnc = new Function(scriptCode)
//     let config = fnc()
//     return config
//   }

//   makeNewInstance ({ vueCode }) {
//     let config = this.getConfig({ vueCode })
//     let { templateCode } = this.processVueCode({ vueCode })
//     let newObj = {
//       ...config,
//       mixins: [require('../../Core/RenderRoot.js').RenderRoot],
//       render: this.compileTemplate({ templateCode })
//     }
//     return newObj
//   }

//   // provideTexture () {
//   //   let dpi = window.devicePixelRatio || 1
//   //   this.renderTarget = new WebGLRenderTarget(340 * dpi, 340 * dpi)
//   //   this.runBox = new RunBox({ onMasterLoop: this.core.onMasterLoop })
//   // }
//
// }