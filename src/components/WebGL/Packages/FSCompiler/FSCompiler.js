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
    path: './package.js',
    isPackageEntry: true,
    isEntry: true,
    _id: getID(),
    type: 'file',
    src: `export { unit } from './package/main.js'`
  },
  {
    path: './preview.js',
    _id: getID(),
    isPreviewEntry: true,
    isEntry: true,
    type: 'file',
    src: `
import { unit } from './package.js'
import { VisualEngine } from './preview/VisualEngine.js'

let engine = new VisualEngine()
engine.waitForSetup()
  .then(async () => {
    let visual = await unit.make(engine)
  })
`
  },
  {
    path: './preview/localForage.js',
    _id: getID(),
    type: 'file',
    src: require('!raw-loader!./srcs/localforage.js').default
  },
  {
    path: './preview/VisualEngine.js',
    _id: getID(),
    type: 'file',
    src: `
import localForage from './localForage.js'

const store = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "ScriptProvider"
});

// console.log(store)

export const loadFile = (url) => {
  return new Promise((resolve) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        resolve(this.responseText)
      }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
  })
}

export const js2url = ({ js }) => {
  let appScriptBlob = new Blob([js], { type: 'text/javascript' })
  let appScriptURL = URL.createObjectURL(appScriptBlob)
  return appScriptURL
}

export const provideURL = async (url) => {
  let js = await store.getItem(url)
  if (!js) {
    let text = await loadFile(url)
    await store.setItem(url, text)
    js = text
  }
  return js2url({ js })
}

export const importCache = async (url) => {
  url = await provideURL(url)
  let MOD = await import(url)
  return MOD
}

export class VisualEngine {
  constructor () {
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

    let THREE = await importCache('https://unpkg.com/three@0.119.1/build/three.module.js')
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
`
  },
  {
    path: './package/main.js',
    _id: getID(),
    type: 'file',
    src: `
import boxV from './shader/box.vert'
import boxF from './shader/box.frag'

export const unit = {
  make: async (engine) => {
    let { THREE, onLoop, onResize, onClean, scene } = engine
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

    scene.add(box)

  }
}
`
  },
  {
    path: './package/shader/box.vert',
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
    path: './package/shader/box.frag',
    _id: getID(),
    type: 'file',
    src: `varying vec3 v_pos;

void main (void) {
  gl_FragColor = vec4(normalize(v_pos.xyz) + 0.3, 1.0);
}
`
  },

  {
    path: './preview/util.js',
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
    let r = {
      ...e,
      _id: e._id,
      path: e.path,
      src: e.src,
      type: e.type
    }
    delete r.parent
    delete r.level
    return r
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

export const getNewFolderObject = ({ path }) => {
  let name = 'new-folder-' + Math.floor(Math.random() * 1000)
  return {
    _id: getID(),
    children: [
      // {
      //   _id: getID(),
      //   children: [],
      //   name: 'new.js',
      //   type: 'file',
      //   path:  path + '/new-folder' + '/new.js',
      //   src: `${path + '/new-folder'}\nsome new code`
      // }
    ],
    name,
    type: 'folder',
    path:  path + '/' + name
  }
}

export const addFile = ({ folder }) => {
  let item = getNewFileObject({ path: folder.path })
  folder.children.push(item)
}

export const addFolder = ({ folder }) => {
  let item = getNewFolderObject({ path: folder.path })
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

export const makeUnitPreview = async ({ pack, others = '' }) => {
  if (!pack) {
    pack = {
      name: 'main',
      list: getDefaultList()
    }
    console.log('You missed pack')
  }

  let code = await RollMeUp.buildInput({ pack, mode: 'view' })
  let mainTag = js2tag({ js: code })

  let HTML = html + ''
  let appTag = `<div id="app"></div>`

  HTML = HTML.replace(`${appTag}`,`${appTag}
    ${js2tag({ js: others })}
    ${mainTag}
  `)

  let blob = new Blob([HTML], { type: 'text/html' })
  let htmlURL = URL.createObjectURL(blob)
  return htmlURL
}


export const makeUnitModule = async ({ pack }) => {
  if (!pack) {
    pack = {
      name: 'makeUnitModule',
      list: getDefaultList()
    }
    console.log('You missed pack')
  }

  let code = await RollMeUp.buildInput({ pack, mode: 'package' })

  // let mainTag = js2tag({ js: code })

  // let HTML = html + ''
  // let appTag = `<div id="app"></div>`
  // HTML = HTML.replace(`${appTag}`,`${appTag}
  //   ${mainTag}
  // `)

  // let blob = new Blob([HTML], { type: 'text/html' })
  // let htmlURL = URL.createObjectURL(blob)

  return code
}

