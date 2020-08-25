import * as Babel from '@babel/standalone/babel.js'
// import * as VueCompo from './vue.processor.js'
let requireLib = require('!raw-loader!./require.js').default

function getTagContent (str, start, end) {
  if (str.indexOf(start) === -1) {
    return false
  }
  return str.slice(str.indexOf(start) + start.length, str.indexOf(end))
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


var dynamicSpread = require('babel-plugin-transform-object-rest-spread')
Babel.registerPlugin('transform-object-rest-spread', dynamicSpread)

var umd = require('babel-plugin-transform-es2015-modules-umd')
Babel.registerPlugin('transform-es2015-modules-umd', umd)

var es6 = [
  [ 'transform-object-rest-spread', { 'useBuiltIns': true } ],
  [
    'transform-es2015-modules-umd',
    {
      exactGlobals: true
    }
  ]
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
    path: './main.js',
    type: 'file',
    isLeaf: true,
    src: `
      import { gets } from './src/app.js'
      import fun from './src/fun.js'

      console.log('console.log from main.js')
      console.log(gets())
      console.log(fun())
      console.log(location.origin)
    `
  },
  {
    path: './src/fun.js',
    type: 'file',
    isLeaf: true,
    src: `
      const fun = () => "Hello Fun fun World";
      export default fun;
    `
  },
  {
    path: './src/app.js',
    type: 'file',
    isLeaf: true,
    src: `
      import box from './shader/box.vert'
      console.log(box);
      export const gets = () => "Cannot read asdsadasd. lol";
      export default gets;
    `
  },
  {
    path: './src/shader/box.vert',
    type: 'file',
    isLeaf: true,
    src: `
      // GLSL SHADER
      uniform vec2 resolution;
      main () {
      }
    `
  },
  {
    path: './src/shader/box.frag',
    type: 'file',
    isLeaf: true,
    src: `
      // GLSL SHADER
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
      isLeaf: false,
      isExpanded: true,
      type: 'folder'
    })
  }
})
DefaultFilesList = DefaultFilesList.map(e => {
  e.title = path.basename(e.path)
  return e
})

export function flatToTree (files) {
  var path = require('path')
  let cloned = files.slice()
  cloned.forEach(f => {
    var dir = path.dirname(f.path)
    if (!cloned.map(e => e.path).includes(dir) && dir !== '.') {
      cloned.push({
        path: dir,
        isLeaf: false,
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
    path: './',
    type: 'folder',
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
      path: e.path,
      src: e.src,
      type: e.type,
      isLeaf: e.type === 'file'
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

export const compilTree = async ({ tree = DefaultFilesTree }) => {
  return compileList({ files: treeToFlat(tree) })
}

export const compileList = ({ files = DefaultFilesList }) => {
  return Promise.all(files.map((file) => {
    return compileEach(file)
  })).then((all) => {
    var entry = all.reduce((accu, val) => {
      return accu + '\n\n' + val.output
    }, '')
    var rand = (Math.random() * 100000000000000).toFixed(0)
    var result = `
${requireLib}
(function(){
  function OMG_${rand} () {
    var self = this;

    ${entry}

    requireJSRequire(['./main.js'], function () {
      setTimeout(() => {
        (window.opener || window.top).postMessage({ type: 'requirejs-ready' }, window.location.origin);
      }, 10);
    });
  }
  new OMG_${rand}();
}());

`
    return result
  })
}
