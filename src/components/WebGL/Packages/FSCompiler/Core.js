import * as UI from '../../AppUIs/EditorSpace/ageUI'
import { getID } from '../../Core/O3DNode'
import { getDefaultTree, makeMonitor, treeToFlat } from './FSCompiler'
import { EventDispatcher } from 'three/build/three.module'

export class AppCore extends EventDispatcher {
  constructor () {
    super()
    this.wins = []
    this.works = []
    this.arrows = []

    this.trashedWorks = []

    this.current = {
      workFrom: false,
      workType: false
    }

    this.initAirGapForBlock = 5

    this.genesisTypes = [
      'points',
      'linesegments',
      'mesh'
    ]
    this.influenceType = [
      'dots',
      'line',
      'faces'
    ]
  }
  async makeMonitorByWork ({ work }) {
    let main = {
      name: work._id,
      list: treeToFlat(work.tree)
    }
    let code = await makeMonitor({ pack: main })
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
  refresh () {
    window.dispatchEvent(new Event('plot-curve'))
    setTimeout(() => {
      window.dispatchEvent(new Event('plot-curve'))
    }, 50)
    setTimeout(() => {
      window.dispatchEvent(new Event('plot-curve'))
    }, 100)
  }
  getCurrentWorkFrom () {
    return this.works.find(e => e._id === this.current.workFrom._id)
  }
  removeArrow ({ arrow }) {
    let idx = this.arrows.findIndex(a => a._id === arrow._id)
    console.log(idx, arrow)
    if (idx !== -1) {
      this.arrows.splice(idx, 1)
    }
    this.refresh()
  }
  createWorkAtPos ({ position }) {
    let newItem = {
      _id: getID(),
      type: this.current.workType,
      tree: getDefaultTree(),
      position: { x: position.x, y: position.y + this.initAirGapForBlock, z: position.z },
    }
    if (this.genesisTypes.includes(this.current.workType)) {
      newItem.isGenesis = true
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
    })
    this.refresh()
  }
  onSetCurrentWorkFrom ({ work }) {
    this.current.workFrom = work
  }
  onSetCurrentWorkType ({ type }) {
    this.current.workType = type
  }
  onAddArrow ({ workTo }) {
    // console.log(workTo, this.current)
    let hasFound = this.arrows.find(e => {
      return e.from === this.current.workFrom._id && e.to === workTo._id
      || e.to === this.current.workFrom._id && e.from === workTo._id
    })

    if (!hasFound) {
      this.arrows.push({
        _id: getID(),
        from: this.current.workFrom._id,
        to: workTo._id
      })
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
      let win = UI.getWin({ title: work._id, appName: 'editor' }, {}, { type: 'work', _id: work._id })
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
  }
  restoreWork ({ work }) {
    let idx = this.trashedWorks.indexOf(work)
    if (idx !== -1) {
      this.trashedWorks.splice(idx, 1)
    }
    this.works.push(work)
  }
  addDemoOps () {
    // this.works.push(
    //   ...[
    //     {
    //       _id: getID(),
    //       type: 'genesis',
    //       isGenesis: true,
    //       tree: getDefaultTree(),
    //       position: { x: -250 / 4, y: 0, z: 0 },
    //     },
    //     // {
    //     //   _id: getID(),
    //     //   type: 'genesis',
    //     //   tree: getDefaultTree(),
    //     //   position: { x: 0, y: 1, z: -100 / 4 },
    //     // },
    //     // {
    //     //   _id: getID(),
    //     //   type: 'genesis',
    //     //   tree: getDefaultTree(),
    //     //   position: { x: 250 / 4, y: 2, z: 0 },
    //     // }
    //   ]
    // )

    // this.arrows.push(
    //   ...[
    //     {
    //       _id: getID(),
    //       from: this.works[0]._id,
    //       to: this.works[1]._id,
    //     },
    //     {
    //       _id: getID(),
    //       from: this.works[1]._id,
    //       to: this.works[2]._id,
    //     }
    //   ]
    // )

    this.current.workType = 'mesh'
    this.createWorkAtPos({ position: { x: -110, y: 0, z: 0 } })
    this.provideWorkWin({ work: this.works[0] })

    this.refresh()
  }
  // UI.getWin({ title: 'Editor', appName: 'editor' })
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
