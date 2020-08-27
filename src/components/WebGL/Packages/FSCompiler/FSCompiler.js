import * as RollMeUp from '../Rollup/Rollup.js'
// import * as Babel from '@babel/standalone/babel.js'
// import * as VueCompo from './vue.processor.js'
// let requireLib = require('!raw-loader!./srcs/require.js').default
let loadExt = require('!raw-loader!./srcs/loadExt.js').default

// function getTagContent (str, start, end) {
//   if (str.indexOf(start) === -1) {
//     return false
//   }
//   return str.slice(str.indexOf(start) + start.length, str.indexOf(end))
// }

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

// default files
var DefaultFilesList = [
  {
    path: './share.js',
    _id: getID(),
    type: 'file',
    src: `export { unit } from './src/unit.js'`
  },
  {
    path: './view.js',
    _id: getID(),
    type: 'file',
    src: `
import { unit } from './share.js'
import { engine } from './hooks-engine.js'

Promise.all([
  engine.wait
])
  .then(async () => {
    let visual = await unit.make(engine)
    engine.preview(visual)
  })
`
  },
  {
    path: './hooks-engine.js',
    _id: getID(),
    type: 'file',
    src: `

class PreviewBox {
  constructor () {
    let wait = this.setup()
    this.wait = wait
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

    window.addEventListener('resize', () => {
      try {
        this.resizeTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    })

    this.cleanUp = () => {
      isAborted = true
      try {
        this.cleanTasks.forEach(e => e())
      } catch (e) {
        console.error(e)
      }
    }

    let THREE = await import('https://unpkg.com/three@0.119.1/build/three.module.js')
    this.THREE = THREE
    let { Scene, WebGLRenderer, PerspectiveCamera } = THREE

    var camera = this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 50

    this.onResize(() => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    })

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpah: true
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
  preview (v) {
    this.scene.add(v)
  }
}

const engine = new PreviewBox()
export { engine }
`
  },
  {
    path: './src/unit.js',
    _id: getID(),
    type: 'file',
    src: `
import boxV from './shader/box.vert'
import boxF from './shader/box.frag'

export const unit = {
  make: async ({ THREE, onLoop, onResize, onClean }) => {
    let { Mesh, BoxBufferGeometry, MeshBasicMaterial, Color } = THREE
    // let { GPUComputationRenderer } = await import('https://unpkg.com/three@0.119.1/examples/jsm/misc/GPUComputationRenderer.js')

    let geo = new BoxBufferGeometry(25, 25, 25, 10, 10, 10)

    let uniforms = {
      time: { value: 0 }
    }
    var mat = new THREE.ShaderMaterial({
      uniforms,
      wireframe: true,
      transparent: true,
      vertexShader: boxV,
      fragmentShader: boxF
    });

    let box = new Mesh(geo, mat)
    onLoop(() => {
      uniforms.time.value = window.performance.now() * 0.001
    })

    onResize(() => {

    })
    return box
  }
}
`
  },
  {
    path: './src/shader/box.vert',
    _id: getID(),
    type: 'file',
    src: `uniform float time;
varying vec3 v_pos;
void main(void) {
  vec3 nPos = position;
  nPos.x += sin(nPos.y * 0.1 + time * 10.0) * 10.0;

  v_pos = vec3(nPos.x, nPos.y, nPos.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}
`
  },
  {
    path: './src/shader/box.frag',
    _id: getID(),
    type: 'file',
    src: `varying vec3 v_pos;

void main (void) {
  gl_FragColor = vec4(normalize(v_pos.xyz) + 0.3, 1.0);
}
`
  },

  {
    path: './src/tools.js',
    _id: getID(),
    type: 'file',
    src: `
${loadExt}

export const load = (urls) => {
  return new Promise((resolve) => {
    new loadExt(urls, () => {
      resolve()
    })
  })
}
`
  },
]

var path = require('path')
DefaultFilesList.forEach(f => {
  var dir = path.dirname(f.path)
  if (!DefaultFilesList.map(e => e.path).includes(dir) && dir !== '.') {
    DefaultFilesList.push({
      path: dir,
      isExpanded: true,
      type: 'folder'
    })
  }
})

export function flatToTree (files) {
  var path = require('path')
  let cloned = files.slice()
  cloned.forEach(f => {
    var dir = path.dirname(f.path)
    if (!cloned.map(e => e.path).includes(dir) && dir !== '.') {
      cloned.push({
        path: dir,
        isExpanded: true,
        type: 'folder'
      })
    }
  })

  cloned = cloned.sort((a, b) => {
    return a > b
  })

  let filesMap = []

  filesMap = cloned.reduce(function(tree, f) {
    var dir = path.dirname(f.path)
    if (tree[dir]) {
      tree[dir].children.push(f)
    } else {
      tree[dir] = { implied: true, children: [f] }
    }

    if (tree[f.path]) {
      f.children = tree[f.path].children
    } else {
      f.children = []
    }

    return (tree[f.path] = f), tree
  }, {})

  let children = Object.keys(filesMap).reduce(function(tree, f) {
    if (filesMap[f].implied) {
      return tree.concat(filesMap[f].children)
    }
    return tree
  }, [])

  return {
    _id: getID(),
    path: './',
    type: 'folder',
    isFolder: true,
    children
  }
}

function _flatten(treeObj, idAttr, parentAttr, childrenAttr, levelAttr) {
  if (!idAttr) idAttr = 'id'
  if (!parentAttr) parentAttr = 'parent'
  if (!childrenAttr) childrenAttr = 'children'
  if (!levelAttr) levelAttr = 'level'

  function flattenChild(childObj, parentId, level) {
      var array = []

      var childCopy = Object.assign({}, childObj)
      childCopy[levelAttr] = level
      childCopy[parentAttr] = parentId
      delete childCopy[childrenAttr]
      array.push(childCopy)

      array = array.concat(processChildren(childObj, level))

      return array
  }

  function processChildren(obj, level) {
      if (!level) level = 0
      var array = []

      obj[childrenAttr].forEach(function(childObj) {
          array = array.concat(flattenChild(childObj, obj[idAttr], level+1))
      })

      return array
  }

  var result = processChildren(treeObj)

  return result
}

export function treeToFlat (tree) {
  let result = _flatten(tree)

  result = result.filter(e => {
    return e.type === 'file'
  }).map(e => {
    return {
      _id: e._id,
      path: e.path,
      src: e.src,
      type: e.type
    }
  })
  return result
}

// let DefaultFilesTree = flatToTree(DefaultFilesList)

export const getDefaultList = () => {
  let result = JSON.parse(JSON.stringify(DefaultFilesList))
  result.forEach(e => {
    e._id = getID()
  })
  return result
}

export const getDefaultTree = () => {
  return JSON.parse(JSON.stringify(flatToTree(getDefaultList())))
}

export const getNewFileObject = ({ path }) => {
  return {
    _id: getID(),
    children: [],
    name: 'new.js',
    type: 'file',
    path:  path + '/new.js',
    src: `${path}\nsome new code`
  }
}

export const addFolder = ({ folder }) => {
  let item = getNewFileObject({ path: folder.path })
  folder.children.push(item)
}

let html = require('!raw-loader!./srcs/index.html').default

export const script2tag = ({ js }) => `<script type="module">${js}</script>`
export const url2tag = ({ url }) => `<script type="module" src="${url}"></script>`

export const js2tag = ({ js }) => {
  let url = js2url({ js })
  return url2tag({ url })
}

export const js2url = ({ js }) => {
  let appScriptBlob = new Blob([js], { type: 'text/javascript' })
  let appScriptURL = URL.createObjectURL(appScriptBlob)
  return appScriptURL
}

export const makeUnitPreview = async ({ pack }) => {
  if (!pack) {
    pack = {
      name: 'main',
      list: getDefaultList()
    }
  }

  let code = await RollMeUp.buildInput({ pack, mode: 'view' })
  let mainTag = js2tag({ js: code })

  let HTML = html + ''
  let appTag = `<div id="app"></div>`
  HTML = HTML.replace(`${appTag}`,`${appTag}
    ${mainTag}
  `)

  let blob = new Blob([HTML], { type: 'text/html' })
  let htmlURL = URL.createObjectURL(blob)
  return htmlURL
}

