import { EventDispatcher } from 'three'

export class WBTextureProviderEngine extends EventDispatcher {
  constructor () {
    super()
    let isAborted = false
    this.tasks = []
    this.resizeTasks = []
    this.cleanTasks = []
    this.refreshTask = []
    this.onLoop = (fnc) => {
      this.tasks.push(fnc)
    }
    this.onClean = (fnc) => {
      this.cleanTasks.push(fnc)
    }

    this.onResize = (fnc) => {
      fnc()
      this.resizeTasks.push(fnc)
    }

    this.onRefresh = (fnc) => {
      this.refreshTask.push(fnc)
    }

    this.runRefresh = () => {
      try {
        this.refreshTask.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    this.runLoop = () => {
      if (isAborted) {
        return
      }
      try {
        this.tasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
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
      isAborted = true
      try {
        this.cleanTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    // this.runLoop()
    // this.onMasterLoop(() => {
    //   if (isAborted) {
    //     return
    //   }

    //   try {
    //     this.tasks.forEach(e => e())
    //   } catch (e) {
    //     console.error(e)
    //   }
    // })
  }
}