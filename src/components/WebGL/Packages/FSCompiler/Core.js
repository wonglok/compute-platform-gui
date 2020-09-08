import * as UI from '../../AppUIs/EditorSpace/ageUI'
import { getID } from '../../Core/O3DNode'
import { getDefaultTree } from './FSCompiler'

export class AppCore {
  constructor () {
    this.wins = []
    this.works = []
    this.resources = []
    this.pub = []
    this.sub = []
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
    if (this.canDelete()) {
      let works = this.works
      works.splice(works.findIndex(e => e === work), 1)
      let win = this.findWinByWork({ work })
      this.removeWin({ win })
    }

  }
  addDemoOps () {
    this.works.push(
      ...[
        {
          _id: getID(),
          type: 'genesis',
          tree: getDefaultTree(),
          position: { x: 0, y: 0, z: 0 },
        },
        {
          _id: getID(),
          type: 'resources',
          tree: getDefaultTree(),
          position: { x: 100, y: 1, z: 0 },
        },
        {
          _id: getID(),
          type: 'resources',
          tree: getDefaultTree(),
          position: { x: 130, y: 2, z: 0 },
        }
      ]
    )
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
