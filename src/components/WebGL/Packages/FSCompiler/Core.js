import * as UI from '../../AppUIs/EditorSpace/ageUI'
import Vue from 'vue'
import { getID } from '../../Core/O3DNode'
import { makeMonitorCode, makePackageCode, makeVueCode, treeToFlat } from './FSCompiler'
import { EventDispatcher } from 'three/build/three.module'
// import { EventDispatcher } from './UMD'
import WorkBoxTypes from '../../AppUIs/EditorWorkBoxTypes/WorkBoxTypes.js'
// console.log(JSON.stringify(WorkBoxTypes, null, '  '))

// export class Shell {
//   constructor ({ core, vm }) {
//     this.core = core
//     this.vm = vm
//   }
// }

export { WorkBoxTypes }

export class AppCore extends EventDispatcher {
  constructor ({ onLoop, $root }) {
    super()
    this.$root = $root
    this.onMasterLoop = onLoop
    this.wins = []
    this.works = []
    this.arrows = []

    this.trashedWorks = []

    this.current = {
      workIDForPreview: false,
      workFrom: false,
      workType: false
    }

    this.initAirGapForBlock = 5

    this.drawTypes = [
      'points',
      'linesegments',
      'mesh'
    ]

    this.workTypes = [
    ]
  }
  getCurrentWork () {
    let win = this.wins[this.wins.length - 1]
    if (win) {
      return this.getWorkByWin({ win })
    } else {
      return false
    }
    // return this.works.find(e => e._id === this.current.workIDForPreview)
  }

  // async openPipelineSystem () {
  //   let create = () => {
  //     let win = UI.getWin({ title: 'Pipeline System', appName: 'edit-pipeline' }, {}, { type: 'root-pipeline', _id: getID() })
  //     this.openWin({ win })
  //     return win
  //   }

  //   let win = this.wins.find(e => e.data.type === 'root-pipeline')
  //   if (!win) {
  //     win = create()
  //     console.log('create')
  //   } else {
  //     this.showWin({ win })
  //     console.log('show')
  //   }

  //   let wins = this.wins
  //   UI.focusApp({ wins, win })
  //   win.show = true
  // }

  async makeWorkBoxMonitor ({ work }) {
    let main = {
      name: 'BoxMonitor',
      list: treeToFlat(work.fileTree)
    }

    let code = await makeMonitorCode({ pack: main })
    try {
      let simpleFnc = new Function(`
        let exports = {};
        let module = {};
        function newFunc () {
          ${code}
        }
        new newFunc()
        return exports
      `)
      let obj = simpleFnc()
      return obj
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async makePackageModule ({ work }) {
    let main = {
      name: 'PackageCode',
      list: treeToFlat(work.fileTree)
    }

    let code = await makePackageCode({ pack: main })
    try {
      let simpleFnc = new Function(`
        let exports = {};
        let module = {};
        function newFunc () {
          ${code}
        }
        new newFunc()
        return exports
      `)
      let obj = simpleFnc()
      return obj
    } catch (e) {
      console.log(e)
      return false
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

  refresh () {
    window.dispatchEvent(new Event('plot-curve'))
    setTimeout(() => {
      window.dispatchEvent(new Event('plot-curve'))
    }, 150)
    setTimeout(() => {
      window.dispatchEvent(new Event('plot-curve'))
    }, 200)
  }

  getCurrentWorkFrom () {
    return this.works.find(e => e._id === this.current.workFrom)
  }

  // removeArrowByID ({ arrowID }) {
  //   let idx = this.arrows.findIndex(a => a._id === arrowID)
  //   // console.log(idx, arrow)
  //   if (idx !== -1) {
  //     this.arrows.splice(idx, 1)
  //     this.arrows = JSON.parse(JSON.stringify(this.arrows))
  //     this.refresh()
  //   } else {
  //     console.log('cant find id', arrowID)
  //     return false
  //   }
  // }

  removeArrow ({ arrow }) {
    let idx = this.arrows.findIndex(a => a._id === arrow._id)
    // console.log(idx, arrow)
    if (idx !== -1) {
      this.arrows.splice(idx, 1)
      this.arrows = JSON.parse(JSON.stringify(this.arrows))
      this.refresh()
    } else {
      console.log('cant find id', arrow._id)
      return false
    }
  }

  createWorkAtPos ({ position, type = this.current.workType }) {
    let workTypeConfigFS = WorkBoxTypes.find(e => e.type === type)
    if (!workTypeConfigFS) {
      throw new Error('cant find workbox type, given: ' + type)
    }

    let newItem = {
      // color: color,
      ...JSON.parse(JSON.stringify(workTypeConfigFS)),
      // tree: false,
      // tree: getDefaultTree(),
      position: { x: position.x, y: position.y + this.initAirGapForBlock, z: position.z },
      _id: getID(),
    }

    if (this.drawTypes.includes(this.current.workType)) {
      newItem.isDrawType = true
    }

    this.works.push(newItem)
    this.refresh()
    return newItem
  }
  removeLinksOfWork ({ work }) {
    let arrowsToBeRemoved = this.arrows.filter(e => e.from === work._id || e.to === work._id)
    arrowsToBeRemoved.forEach((arrow) => {
      let idx = this.arrows.findIndex(a => a === arrow)
      this.arrows.splice(idx, 1)
      this.refresh()
    })
    this.refresh()
  }
  onSetCurrentWorkFrom ({ work }) {
    this.current.workFrom = work._id
  }
  onSetCurrentWorkType ({ type }) {
    this.current.workType = type
  }
  onAddArrow ({ direction, workTo }) {
    // console.log(workTo, this.current)
    let hasFound = this.arrows.find(e => {
      return e.from === this.current.workFrom && e.to === workTo._id
      || e.to === this.current.workFrom && e.from === workTo._id
    })

    if (!hasFound) {
      if (direction === 'out') {
        this.arrows.push({
          _id: getID(),
          r: Math.random(),
          errorMsg: '',
          direction: direction,
          from: this.current.workFrom,
          to: workTo._id
        })
      } else if (direction === 'in') {
        this.arrows.push({
          _id: getID(),
          r: Math.random(),
          errorMsg: '',
          direction: direction,
          to: this.current.workFrom,
          from: workTo._id
        })
      }
    } else {
      console.log('already added link')
    }
    this.refresh()
  }
  getWorkByWin ({ win }) {
    let _id = win.data._id
    let item = false
    if (win.data.type === 'work') {
      item = this.works.find(e => e._id === _id)
    }
    return item
  }
  findWinByWork ({ work }) {
    let win = this.wins.find(e => {
      if (e && e.data && e.data._id) {
        if (e.data._id === work._id) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    })
    return win
  }
  provideWorkWin ({ work }) {
    let create = () => {
      let win = UI.getWin({ title: `Core: ${work._id} (${work.type})`, appName: 'editor' }, {}, { type: 'work', _id: work._id })
      this.openWin({ win })
      return win
    }

    let win = this.findWinByWork({ work })
    if (!win) {
      win = create()
      console.log('create')
    } else {
      this.showWin({ win })
      console.log('show')
    }

    let wins = this.wins
    UI.focusApp({ wins, win })
    win.show = true
  }

  provideWindowWithAppName ({ work }) {
    let create = () => {
      let win = UI.getWin({ title: `Props: ${work._id} (${work.type})`, appName: 'props-editor' }, {}, { type: 'work', _id: work._id })
      this.openWin({ win })
      return win
    }

    let win = this.findWinByWork({ work })
    if (!win) {
      win = create()
      console.log('create')
    } else {
      this.showWin({ win })
      console.log('show')
    }

    let wins = this.wins
    UI.focusApp({ wins, win })
    win.show = true
  }

  providePropsWin ({ work }) {
    let create = () => {
      let win = UI.getWin({ title: `Props: ${work._id} (${work.type})`, appName: 'props-editor' }, {}, { type: 'work', _id: work._id })
      this.openWin({ win })
      return win
    }

    let win = this.findWinByWork({ work })
    if (!win) {
      win = create()
      console.log('create')
    } else {
      this.showWin({ win })
      console.log('show')
    }

    let wins = this.wins
    UI.focusApp({ wins, win })
    win.show = true
  }

  canDelete () {
    let keepMinimumOpen = 1
    if (this.works.length > keepMinimumOpen) {
      return true
    } else {
      return false
    }
  }
  removeWork ({ work }) {
    this.removeLinksOfWork({ work })

    let works = this.works
    works.splice(works.findIndex(e => e === work), 1)
    let win = this.findWinByWork({ work })
    if (win) {
      this.removeWin({ win })
    }
    this.refresh()
  }
  moveWorkToTrash ({ work }) {
    this.removeLinksOfWork({ work })
    let works = this.works
    let idx = works.findIndex(e => e === work)
    works.splice(idx, 1)
    let win = this.findWinByWork({ work })
    if (win) {
      this.removeWin({ win })
    }
    this.trashedWorks.push(work)
    this.refresh()
  }
  restoreWork ({ work }) {
    let idx = this.trashedWorks.indexOf(work)
    if (idx !== -1) {
      this.trashedWorks.splice(idx, 1)
    }
    this.works.push(work)
    this.refresh()
  }
  addDemoOps () {

  }

  removeWin ({ win }) {
    let idx = this.wins.findIndex(e => e === win)
    if (idx !== -1) {
      this.wins.splice(idx, 1)
    }
  }
  toggleWin ({ win }) {
    win.show = !win.show
  }
  minWin ({ win }) {
    win.show = false
  }
  showWin ({ win }) {
    win.show = true
  }
  openWin ({ win }) {
    let newWin = win || UI.getWin({ tite: 'Editor', appName: 'editor' })
    newWin.show = true
    this.wins.push(newWin)
    return newWin
  }
}
