export class VisualEngine {
  constructor ({ THREE, singleCachedImport }) {
    this.THREE = THREE
    this.singleCachedImport = singleCachedImport
    this.wait = this.setup()
  }
  async waitForSetup () {
    return this.wait
  }
  async setup () {
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
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio || 1.0)
      }, 16.6668)
    }

    window.addEventListener('message', (ev) => {
      // console.log(ev.data.event === 'resize')
      internalResize()
    })

    window.addEventListener('resize', () => {
      internalResize()
    })

    this.cleanUp = () => {
      isAborted = true
      try {
        this.cleanTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    let { Scene, WebGLRenderer, PerspectiveCamera } = this.THREE

    var camera = this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 50

    this.onResize(() => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    })

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true
    })
    this.onResize(() => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(window.devicePixelRatio || 1.0)
    })

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio || 1.0)

    document.body.appendChild(this.renderer.domElement);
    document.body.style.cssText = 'margin: 0px; padding: 0px;'
    this.scene = new Scene()

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

      this.renderer.render(this.scene, this.camera);
    }
    animate()

    return this
  }
}