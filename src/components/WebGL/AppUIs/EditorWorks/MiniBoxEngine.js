const { EventDispatcher } = require("three/build/three.module")

export class MiniBoxEngine extends EventDispatcher {
  constructor () {
    super()
    let isAborted = false
    this.tasks = []
    this.resizeTasks = []
    this.cleanTasks = []
    this.onLoop = (v) => {
      this.tasks.push(v)
    }

    this.onResize = (v) => {
      v()
      this.resizeTasks.push(v)
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

    var animate = () => {
      requestAnimationFrame(animate);

      if (isAborted) {
        return
      }

      try {
        this.tasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }
    animate()
  }
}