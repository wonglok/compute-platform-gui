import { Clock, Color, EventDispatcher, PerspectiveCamera, Scene } from 'three'
import * as THREE from 'three'
import Vue from 'vue'
import { Chrome } from 'vue-color'
// import { O3DVue } from '../../Core/O3DVue'

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export class CoreShell {
  constructor ({ work, $vm }) {
    this.work = work
    this.$vm = $vm

    this.last = {
      scriptCode: ''
    }

    let vueCode = this.getVueCode()

    this.$vm.dynamo = this.makeNewInstance({ vueCode })

    this.$vm.$root.$on('refresh-shell', () => {
      let vueCode = this.getVueCode()
      let { scriptCode } = this.processVueCode({ vueCode })
      if (scriptCode !== this.last.scriptCode) {
        this.$vm.dynamo = this.makeNewInstance({ vueCode })
      } else {
        this.onRefresh({ vueCode })
      }
      this.last.scriptCode = scriptCode
    })
  }

  getVueCode () {
    let file = this.work.fileTree.children.find(e => e.path === './gui.vue')
    if (file) {
      return file.src
    }
  }

  processVueCode ({ vueCode }) {
    let templateCode = vueCode.match(/<template>([\S\s]*?)<\/template>/gi)
    templateCode = templateCode[0]
    templateCode = templateCode.replace(/^<template>/, '')
    templateCode = templateCode.replace(/<\/template>$/, '')

    let styleCode = vueCode.match(/<style([\S\s]*?)<\/style>/gi)
    let styleHTML = styleCode[0]

    let scriptCode = vueCode.match(/<script>([\S\s]*?)<\/script>/gi)
    scriptCode = scriptCode[0]
    scriptCode = scriptCode.replace(/^<script>/, '')
    scriptCode = scriptCode.replace(/<\/script>$/, '')

    return {
      templateCode,
      styleHTML,
      scriptCode
    }
  }

  // compileTemplate ({ templateCode }) {
  //   let templateRenderFnc = Vue.compile(templateCode)
  //   return templateRenderFnc.render
  // }

  // onRefresh ({ vueCode }) {
  //   let { templateCode } = this.processVueCode({ vueCode })
  //   if (this.$vm.$refs.dynamo) {
  //     this.$vm.$refs.dynamo.$options.render = this.compileTemplate({ templateCode })
  //     this.$vm.$refs.dynamo.$forceUpdate()
  //   }
  // }

  getConfig ({ vueCode }) {
    let { scriptCode } = this.processVueCode({ vueCode })
    scriptCode = scriptCode.replace('export default ', 'return ')
    let fnc = new Function(scriptCode)
    let config = fnc()
    return config
  }

  makeNewInstance ({ vueCode }) {
    let config = this.getConfig({ vueCode })
    let { templateCode } = this.processVueCode({ vueCode })
    // config.mixins = config.mixins || [
    // ]
    // config.mixins.push(O3DVue)
    let ACE = require('../../Packages/Editor/ACE.vue').default
    let newObj = {
      ...config,
      components: {
        Chrome,
        ACE
      },
      template: templateCode
      // mixins: [require('../../Core/RenderRoot.js').RenderRoot],
      // render: this.compileTemplate({ templateCode })
    }
    // console.log(newObj)
    return newObj
  }
}
