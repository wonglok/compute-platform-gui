import { EventDispatcher } from 'three'

export class WBTextureProviderEngine extends EventDispatcher {
  constructor ({ onMasterLoop }) {
    super()
    let isAborted = false
    this.onMasterLoop = onMasterLoop
    this.tasks = []
    this.resizeTasks = []
    this.cleanTasks = []
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

    this.onMasterLoop(() => {
      if (isAborted) {
        return
      }

      try {
        this.tasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    })
  }
}