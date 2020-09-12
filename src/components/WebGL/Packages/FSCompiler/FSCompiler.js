import * as RollMeUp from '../Rollup/Rollup.js'

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

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
// let Basic = require('./srcs/basic/loadJS').default
// let DefaultFilesList = Basic

// var path = require('path')
// DefaultFilesList.forEach(f => {
//   var dir = path.dirname(f.path)
//   if (!DefaultFilesList.map(e => e.path).includes(dir) && dir !== '.') {
//     DefaultFilesList.push({
//       path: dir,
//       isExpanded: true,
//       type: 'folder'
//     })
//   }
// })

// export const getDefaultList = () => {
//   let result = JSON.parse(JSON.stringify(DefaultFilesList))
//   result.forEach(e => {
//     e._id = getID()
//   })
//   return result
// }

// export const getDefaultTree = () => {
//   return JSON.parse(JSON.stringify(flatToTree(getDefaultList())))
// }

export const makeListFresh = (v) => {
  let result = JSON.parse(JSON.stringify(v))
  result.forEach(e => {
    e._id = getID()
  })
  return result
}

export const getFreshTreeByRawList = (v) => {
  return JSON.parse(JSON.stringify(flatToTree(makeListFresh(v))))
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

// export const injectToMain = async ({ flat, work, works, arrows }) => {
//   let project = {
//     _id: getID(),
//     children: [],
//     name: 'project.js',
//     type: 'file',
//     path:  './project.json',
//     readOnly: true,
//     src: JSON.stringify({
//       work,
//       works,
//       arrows
//     }, null, '  ')
//   }

//   flat.push(project)

//   return flat
// }

// export const makeProjectSpecs = async ({ work }) => {
//   // if (!pack) {
//   //   console.log('You missed pack')
//   // }
//   let pack = pack = {
//     name: work._id,
//     list: treeToFlat(work.files)
//   }
//   let code = await RollMeUp.buildInput({ pack, mode: 'core' })

//   return code
// }

// export const makeUnitPreviewIframe = async ({ pack, others = '' }) => {
//   // if (!pack) {
//   //   pack = {
//   //     name: 'main',
//   //     list: getDefaultList()
//   //   }
//   //   console.log('You missed pack')
//   // }

//   let code = await RollMeUp.buildInput({ pack, mode: 'iframe' })

//   let mainTag = js2tag({ js: code })

//   let HTML = html + ''
//   let appTag = `<div id="app"></div>`

//   HTML = HTML.replace(`${appTag}`,`${appTag}
//     ${js2tag({ js: others })}
//     ${mainTag}
//   `)

//   let blob = new Blob([HTML], { type: 'text/html' })
//   let htmlURL = URL.createObjectURL(blob)
//   return htmlURL
// }

export const makeMonitor = async ({ pack }) => {
  // if (!pack) {
  //   pack = {
  //     name: 'makeMonitor',
  //     list: getDefaultList()
  //   }
  //   console.log('You missed pack')
  // }

  let code = await RollMeUp.buildInput({ pack, mode: 'monitor' })

  return code
}
