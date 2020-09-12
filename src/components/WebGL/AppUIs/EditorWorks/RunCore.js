import Vue from 'vue'

export class RunCore {
  constructor ({ onMasterLoop, core, $root }) {
    let vm = this
    this.$root = $root
    this.core = core
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
      if (this.vue) {
        this.vue.$destroy()
      }
      try {
        this.cleanTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    this.onMasterLoop(() => {
      this.runLoop()
    })

    let html = v => v[0]

    let makeRunVue = () => {
      return {
        props: {
          runCore: {},
          work: {},
          ctx: {}
        },
        template: `<div><slot></slot></div>`,
        beforeDestroy () {
          this.runCore.readyIDs.delete(this.work._id)
          console.log('before destroy')
        },
        mounted () {
          // console.log(123)

          this.$root.$on(this.work._id, (event) => {
            console.log(event)
          })

          this.runCore.readyIDs.add(this.work._id)
          console.log('mounted')
        }
      }
    }

    this.vue = new Vue({
      components: {
        WorkRunner: makeRunVue()
      },
      template: html`
        <div>
          <div v-for="work in works" :key="work._id">
            <WorkRunner :work="work" :runCore="vm" :ctx="ctx"></WorkRunner>
          </div>
        </div>
      `,
      data () {
        return {
          vm: this,
          readyIDs: new Set([]),
          ctx: {},
          works: vm.core.works,
          arrwos: vm.core.arrows
        }
      }
    })

    this.$root.$on('compile-workbox', (evt) => {
      this.vue.$emit('compile-workbox', evt)
    })

    let div = document.createElement('div')
    this.vue.$mount(div)
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