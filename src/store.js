import create from 'zustand/vanilla'
import * as UI from './components/WebGL/AppUIs/EditorSpace/ageUI'

export const store = create(set => ({
  wins: [],
  bootup: () => set((state) => {
    return {
      wins: [
        // UI.getWin({ tite: 'Editor', appName: 'editor' }),
        UI.getWin({ title: 'Project', appName: 'project' }, { x: 15, y: 15, w: 690, h: 570 })
      ]
    }
  }),
  removeWin: (win) => {
    set(state => {
      let idx = state.wins.findIndex(e => e === win)
    })
  },
  toggleWin: (win) => {
    win.show = !win.show
  },
  minWin: (win) => {
    win.show = false
  },
  showWin: (win) => {
    win.show = true
  },
  openWin: (win) => {
    let newWin = win || UI.getWin({ tite: 'Editor', appName: 'editor' })
    set(state => {
      state.wins.push(newWin)
      return state
    })
    return newWin
  }
}))

export const { getState, setState, subscribe, destroy } = store
