import * as Babel from '@babel/standalone/babel.js'
// import * as VueCompo from './vue.processor.js'
let requireLib = require('!raw-loader!./srcs/require.js').default
let loadExt = require('!raw-loader!./srcs/loadExt.js').default

function getTagContent (str, start, end) {
  if (str.indexOf(start) === -1) {
    return false
  }
  return str.slice(str.indexOf(start) + start.length, str.indexOf(end))
}

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

const getCompoInfo = (compoStr) => {
  var output = {}
  compoStr = compoStr.trim()
  output.template = getTagContent(compoStr, '<template>', '</template>') || ''
  output.script = getTagContent(compoStr, '<script>', '</script>') || ''
  output.style = getTagContent(compoStr, '<style>', '</style>') || getTagContent(compoStr, '<style scoped>', '</style>')

  var scoped = !!getTagContent(compoStr, '<style scoped>', '</style>')
  output.styleScoped = scoped
  return output
}

/*

// minified version (651B, and 336B with gzip)
function loadExt(e,t){var s=this;s.files=e,s.js=[],s.head=document.getElementsByTagName("head")[0],s.after=t||function(){},s.loadStyle=function(e){var t=document.createElement("link");t.rel="stylesheet",t.type="text/css",t.href=e,s.head.appendChild(t)},s.loadScript=function(e){var t=document.createElement("script");t.type="text/javascript",t.src=s.js[e];var a=function(){++e<s.js.length?s.loadScript(e):s.after()};t.onload=function(){a()},s.head.appendChild(t)};for(var a=0;a<s.files.length;a++)/\.js$|\.js\?/.test(s.files[a])&&s.js.push(s.files[a]),/\.css$|\.css\?/.test(s.files[a])&&s.loadStyle(s.files[a]);s.js.length>0?s.loadScript(0):s.after()}

// to use it
new loadExt(["/path/file1.js","/path/file1.css", "file2.js?nocache="+(new Date().getTime()), "file3.js"], function() {
  console.log("all loaded");
})

*/

// var dynamicSpread = require('babel-plugin-transform-object-rest-spread')
// Babel.registerPlugin('transform-object-rest-spread', dynamicSpread)

if (!window['babel-umd']) {
  window['babel-umd'] = true
  var umd = require('babel-plugin-transform-es2015-modules-umd')
  Babel.registerPlugin('transform-es2015-modules-umd', umd)
}

// var commonjs = require('babel-plugin-transform-es2015-modules-commonjs')
// Babel.registerPlugin('transform-es2015-modules-commonjs', commonjs)

var es6 = [
  // [ 'transform-object-rest-spread', { 'useBuiltIns': true } ],
  [
    'transform-es2015-modules-umd',
    {
      exactGlobals: true
    }
  ]
  // [
  //   "transform-modules-commonjs", {
  //     "allowTopLevelThis": true
  //   }
  // ]
]

var compileEach = ({ path, src }) => {
  return new Promise((resolve) => {
    var output

    try {
      if (path.split('.').pop() === 'js') {
        // js
        output = Babel.transform(src, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
        resolve({ output })
      } else if (path.split('.').pop() === 'json') {
        // json
        output = Babel.transform(`export default ${JSON.stringify(JSON.parse(src))};`, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
        resolve({ output })
      } else if (path.split('.').pop() === 'html') {
        // dont include html in the js file
        output = ''
        resolve({ output })
      } else if (path.split('.').pop() === 'css') {
        // text
        let css = JSON.stringify(src)
        let code = `
          var css = ${css};
          var head = document.head || document.getElementsByTagName('head')[0];
          var style = document.createElement('style');
          style.type = 'text/css';
          if (style.styleSheet) {
            style.styleSheet.cssText = css;
          } else {
            style.appendChild(document.createTextNode(css));
          }
          head.appendChild(style);
        `

        output = Babel.transform(code + `export default ` + css, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
        resolve({ output })
      } else if (path.split('.').pop() === 'vue') {
        // vue file

        let info = getCompoInfo(src)
        var scopeID = 'data-s-' + (Math.ceil(Math.random() * 100000)).toString(36)
        let css = JSON.stringify(info.style)
        info.template = info.template.replace('>', `${scopeID}>`)

        /* eslint-disable */

        let code = `
          var css = ${css};
          var head = document.head || document.getElementsByTagName('head')[0];
          var style = document.createElement('style');
          style.type = 'text/css';
          if (style.styleSheet) {
            style.styleSheet.cssText = css;
          } else {
            style.appendChild(document.createTextNode(css));
          }

          function addScope (styleElt, scopeName) {

            function process() {

              var sheet = styleElt.sheet;
              var rules = sheet.cssRules;

              for ( var i = 0; i < rules.length; ++i ) {

                var rule = rules[i];
                if ( rule.type !== 1 )
                  continue;

                var scopedSelectors = [];

                rule.selectorText.split(/\s*,\s*/).forEach(function(sel) {

                  scopedSelectors.push(scopeName+' '+sel);
                  var segments = sel.match(/([^ :]+)(.+)?/);
                  scopedSelectors.push(segments[1] + scopeName + (segments[2]||''));
                });

                var scopedRule = scopedSelectors.join(',') + rule.cssText.substr(rule.selectorText.length);
                sheet.deleteRule(i);
                sheet.insertRule(scopedRule, i);
              }
            }

            try {
              // firefox may fail sheet.cssRules with InvalidAccessError
              process();
            } catch (ex) {

              if ( ex instanceof DOMException && ex.code === DOMException.INVALID_ACCESS_ERR ) {

                styleElt.sheet.disabled = true;
                styleElt.addEventListener('load', function onStyleLoaded() {

                  styleElt.removeEventListener('load', onStyleLoaded);

                  // firefox need this timeout otherwise we have to use document.importNode(style, true)
                  setTimeout(function() {

                    process();
                    styleElt.sheet.disabled = false;
                  });
                });
                return;
              }

              throw ex;
            }
          }

          head.appendChild(style);
          if (${info.styleScoped}) {
            addScope(style, '[${scopeID}]');
          }
        `

        /* eslint-enable */

        // inject template property into the export Object
        info.script = info.script.replace('export default {', `export default { \n\ttemplate: ${JSON.stringify(info.template)},`)

        // console.log(info)

        output = Babel.transform(code + info.script, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
        resolve({ output })
      } else {
        // text
        output = Babel.transform(`export default ` + '`' + `${src}` + '`', { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
        resolve({ output })
      }
    } catch (e) {
      console.log(e)
      output = `
        console.log(JSON.parse("${JSON.stringify(e)}"));
      `
      resolve({ output })
    }
  })
}

// default files
var DefaultFilesList = [
  {
    path: './share.js',
    _id: getID(),
    type: 'file',
    src: `
export { gets } from './src/app.js'
export const random = Math.random();

`
  },
  {
    path: './view.js',
    _id: getID(),
    type: 'file',
    src: `
import { gets, random } from './share.js'
import fun from './src/fun.js'

let i = 0;
setInterval(() => {
  document.body.style.backgroundColor = 'hsla('+ Math.floor(i % 360) +', 50%, 50%, 1.0)';
  i++
}, 10)

Resources.scripts([
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r119/three.min.js'
]).then(() => {

})

let omg = async () => {
  // let t = await gets()
  console.log(random)
  for (let kn in Resources.all) {
    let item = Resources.all[kn]
    console.log(item.random)
  }
}
omg()
`
  },
  {
    path: './src/fun.js',
    _id: getID(),
    type: 'file',
    src: `
const fun = () => "Hello Fun fun World";
export default fun;
`
  },
  {
    path: './src/app.js',
    _id: getID(),
    type: 'file',
    src: `
import boxV from './shader/box.vert'
import boxF from './shader/box.frag'
console.log(boxV);
console.log(boxF);
export const gets = async () => "this is some text";
export default gets;
`
  },
  {
    path: './src/shader/box.vert',
    _id: getID(),
    type: 'file',
    src: `
// GLSL VERTEX SHADER
uniform vec2 resolution;
main () {
}
`
  },
  {
    path: './src/shader/box.frag',
    _id: getID(),
    type: 'file',
    src: `
// GLSL FRAGMENT SHADER
uniform vec2 resolution;
main () {
}
`
  }
]

var path = require('path')
DefaultFilesList.forEach(f => {
  var dir = path.dirname(f.path)
  if (!DefaultFilesList.map(e => e.path).includes(dir) && dir !== '.') {
    DefaultFilesList.push({
      path: dir,
      isFolder: true,
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
        isFolder: true,
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

let DefaultFilesTree = flatToTree(DefaultFilesList)

export const getDefaultList = () => {
  return JSON.parse(JSON.stringify(DefaultFilesList))
}

export const getDefaultTree = () => {
  return JSON.parse(JSON.stringify(flatToTree(DefaultFilesList)))
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

export const compilTree = async ({ packageName, dependencies, type, tree = DefaultFilesTree }) => {
  return compileList({ packageName, dependencies, type, files: treeToFlat(tree) })
}

export const compileList = ({ packageName = 'default-package', dependencies, type, files = DefaultFilesList }) => {
  files = files.map(e => {
    e.path = path.join(`./${packageName}/`, e.path)
    return e
  })
  return Promise.all(files.map((file) => {
    return compileEach(file)
  })).then((all) => {
    var modulesCodes = all.reduce((accu, val) => {
      return accu + '\n\n\n' + val.output
    }, '')

    let names = dependencies.map(e => e.name)
    // + 1 means the view package

    if (type === 'view') {
      let result = `
  (function(){
    ${modulesCodes}

    window.PACKAGE_NAME = ${JSON.stringify(packageName)};
    window.PACKAGE_LIST = ${JSON.stringify(names)};

    window.COMPUTE_PLATFORM_PACKAGES = window.COMPUTE_PLATFORM_PACKAGES || {}

    window.Resources = {
      all: window.COMPUTE_PLATFORM_PACKAGES,
      names: window.PACKAGE_LIST,
      onReady: () => {
        return new Promise((resolve) => {
          let tt = setInterval(() => {
            let all = window.COMPUTE_PLATFORM_PACKAGES
            let names = window.Resources.names
            if (Object.keys(all).length === names.length) {
              clearInterval(tt)
              resolve()
            }
          })
        })
      },
      ensure: (items) => {
        return new Promise((resolve) => {
          new loadExt([...items], function() {
            console.log("all loaded", items);
            resolve()
          })
        })
      },
      urls: new Map(),
      scripts: (items) => {
        return Promise.all(items.map(resourceURL =>  {
          let getStuff = () => {
            if (window.Resources.urls.has(resourceURL)) {
              return Promise.resolve(window.Resources.urls.get(resourceURL))
            }

            return fetch(resourceURL, {
              method: 'get'
            })
            .then(function(body){
              return body.text();
            })
          }

          return getStuff().then((text) => {
            window.Resources.urls.set(resourceURL, text)
            let appScriptBlob = new Blob([text], { type: 'text/javascript' })
            let appScriptURL = URL.createObjectURL(appScriptBlob)
            let script = document.createElement('script')
            script.src = appScriptURL;
            document.body.appendScript(script)

            return { text, url: appScriptURL }
          })
        })).catch(console.log)
      }
    }

    window.Resources.onReady().then(() => {
      BasicImport(['./' + window.PACKAGE_NAME + '/view.js'], function () {
      });
    })
  }());
  `
      return result
    } else if (type === 'share') {
      let result = `
      (function(){
        ${modulesCodes}

        BasicImport(['./${packageName}/share.js'], function (item) {
          console.log(item)
          window.COMPUTE_PLATFORM_PACKAGES = window.COMPUTE_PLATFORM_PACKAGES || {}
          window.COMPUTE_PLATFORM_PACKAGES['${packageName}'] = item
          window.dispatchEvent(new Event('package-loaded'))
        });

      }());
      `
      return result
    }

  })
}

let html = require('!raw-loader!./srcs/index.html').default

export const url2tag = (appScriptURL) => `<script src="${appScriptURL}"></script>`

export const js2tag = ({ js }) => {
  let appScriptBlob = new Blob([js], { type: 'text/javascript' })
  let appScriptURL = URL.createObjectURL(appScriptBlob)
  return url2tag(appScriptURL)
}

let DefaultPackages = [
]

export const makeURLByPackage = async ({ pack = { tree: getDefaultTree() }, dependencies = DefaultPackages }) => {
  let appJsCode = await compilTree({ packageName: pack.name, type: 'view', dependencies, tree: pack.tree })
  let mainTag = js2tag({ js: appJsCode })
  let requireTag = js2tag({ js: requireLib + '\n' + loadExt })

  let depTags = ''
  for (let kn in dependencies) {
    let pack = dependencies[kn]
    let shareJSCode = await compilTree({ packageName: pack.name, type: 'share', dependencies, tree: pack.tree })
    depTags += js2tag({ js: shareJSCode })
  }

  let HTML = html + ''
  let appTag = `<div id="app"></div>`
  HTML = HTML.replace(`${appTag}`,`${appTag}${requireTag}${mainTag}${depTags}`)

  let blob = new Blob([HTML], { type: 'text/html' })
  let htmlURL = URL.createObjectURL(blob)
  return htmlURL
}

