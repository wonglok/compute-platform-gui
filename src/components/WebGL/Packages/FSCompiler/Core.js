import * as UI from '../../AppUIs/EditorSpace/ageUI'
import { getID } from '../../Core/O3DNode'
import { getDefaultTree } from './FSCompiler'
import { EventDispatcher } from 'three/build/three.module'

export class AppCore extends EventDispatcher {
  constructor () {
    super()
    this.wins = []
    this.works = []
    this.arrows = []

    this.current = {
      workFrom: false,
      genesisType: false
    }
    this.initAir = 5
  }
  refresh () {
    window.dispatchEvent(new Event('plot-curve'))
    setTimeout(() => {
      window.dispatchEvent(new Event('plot-curve'))
    })
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
      type: this.current.genesisType,
      tree: getDefaultTree(),
      position: { x: position.x, y: position.y + this.initAir, z: position.z },
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
  onSetCurrentGenesisType ({ type }) {
    this.current.genesisType = type
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
    this.removeWin({ win })
  }
  addDemoOps () {
    this.works.push(
      ...[
        {
          _id: getID(),
          type: 'genesis',
          tree: getDefaultTree(),
          position: { x: -250 / 4, y: 0, z: 0 },
        },
        {
          _id: getID(),
          type: 'genesis',
          tree: getDefaultTree(),
          position: { x: 0, y: 1, z: -100 / 4 },
        },
        {
          _id: getID(),
          type: 'genesis',
          tree: getDefaultTree(),
          position: { x: 250 / 4, y: 2, z: 0 },
        }
      ]
    )

    this.arrows.push(
      ...[
        {
          _id: getID(),
          from: this.works[0]._id,
          to: this.works[1]._id,
        },
        {
          _id: getID(),
          from: this.works[1]._id,
          to: this.works[2]._id,
        }
      ]
    )

    this.refresh()
  }
  // UI.getWin({ title: 'Editor', appName: 'editor' })
  removeWin ({ win }) {
    let wins = this.wins
    let idx = wins.findIndex(e => e === win)
    wins.splice(idx, 1)
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
