import { DragControls } from './DragControls.js'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Vector2, Raycaster, Group } from 'three'
export class Template {
  constructor ({
    rendererDOM,
    onResize,
    onLoop,
    camera,
    onClean
  }) {
    this.rendererDOM = rendererDOM
    this.onResize = onResize
    this.onLoop = onLoop
    this.camera = camera
    this.onClean = onClean

    this.done = this.setup()
  }
  async waitForSetup () {
    return this.done
  }

  async setup () {

  }
}

export class Dragger {
  constructor ({
    toucher,
    wrapper,
    onResize,
    onLoop,
    camera,
    onClean,
    o3d
  }) {
    this.o3d = o3d
    this.toucher = toucher
    this.wrapper = wrapper
    this.onResize = onResize
    this.onLoop = onLoop
    this.camera = camera
    this.onClean = onClean

    this.objects = []
    // this.mouse = new Vector2()
    // this.raycaster = new Raycaster()
    this.group = new Group()
    this.o3d.add(this.group)
    this.enableSelection = false

    this.done = this.setup()

    this.onClean(() => {
      this.objects.forEach(t => {
        this.remove(t)
      })
    })
  }

  async waitForSetup () {
    return this.done
  }

  add (item, attach) {
    item.userData.attach = attach
    this.objects.push(item)
    this.group.add(item)
  }

  remove (item) {
    let idx = this.dragControls.getObjects().findIndex(e => e.uuid === item.uuid)
    if (idx !== -1) {
      this.objects.splice(idx, 1)
    }
    this.group.remove(item)
  }

  setLayer (v) {
    this.dragControls.setLayer(v)
  }

  async setup () {
    this.mapControls = new MapControls(this.camera, this.wrapper)
    this.mapControls.enableDamping = true
    this.mapControls.screenSpacePanning = false
    this.mapControls.enableRotate = false
    this.onLoop(() => {
      this.mapControls.update()
    })

    this.dragControls = new DragControls(this.objects, this.camera, this.toucher)
    this.onClean(() => {
      this.dragControls.deactivate()
      this.dragControls.dispose()
    })
    this.dragControls.addEventListener('drag', (ev) => {
      // console.log(ev)
      let object = ev.object
      if (object) {
        if (object && object.userData && object.userData.attach) {
          let attach = object.userData.attach
          attach.onDrag(ev)
        }
      }
    })

    // this.rendererDOM.addEventListener('click', this.onClick.bind(this), false)

    // window.addEventListener( 'keydown', this.onKeyDown.bind(this), false )
    // window.addEventListener( 'keyup', this.onKeyUp.bind(this), false )
  }

  // onKeyDown ( event ) {
  //   this.enableSelection = ( event.keyCode === 16 ) ? true : false;
  // }

  // onKeyUp () {
  //   this.enableSelection = false;
  // }

  // onClick ( event ) {
  //   event.preventDefault();
  //   this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  //   this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  //   this.raycaster.setFromCamera( this.mouse, this.camera );

  //   var intersections = this.raycaster.intersectObjects(this.objects, true );

  //   if (intersections && intersections.length > 0) {
  //     intersections.forEach(event => {
  //       let userData = event.object.userData
  //       let attach = userData.attach
  //       if (attach) {
  //         // console.log(attach)
  //         if (attach.onClick) {
  //           attach.onClick(event)
  //         }
  //       }
  //     })
  //   }

  //   // if ( this.enableSelection === true ) {

  //   //   var draggableObjects = this.dragControls.getObjects()
  //   //   draggableObjects.length = 0;

  //   //   this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  //   //   this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  //   //   this.raycaster.setFromCamera( this.mouse, this.camera );

  //   //   var intersections = this.raycaster.intersectObjects(this.objects, true );

  //   //   if ( intersections.length > 0 ) {

  //   //     var object = intersections[ 0 ].object;

  //   //     if ( this.group.children.includes( object ) === true ) {
  //   //       object.material.emissive.set( 0x000000 );
  //   //       this.o3d.attach( object );
  //   //     } else {
  //   //       object.material.emissive.set( 0xaaaaaa );
  //   //       this.group.attach( object );
  //   //     }

  //   //     this.dragControls.transformGroup = true;
  //   //     draggableObjects.push( this.group );
  //   //   }

  //   //   if ( this.group.children.length === 0 ) {
  //   //     this.dragControls.transformGroup = false;
  //   //     draggableObjects.push( ...this.objects );
  //   //   }
  //   // }
  // }
}