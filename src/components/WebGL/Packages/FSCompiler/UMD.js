
// const getCompoInfo = (compoStr) => {
//   var output = {}
//   compoStr = compoStr.trim()
//   output.template = getTagContent(compoStr, '<template>', '</template>') || ''
//   output.script = getTagContent(compoStr, '<script>', '</script>') || ''
//   output.style = getTagContent(compoStr, '<style>', '</style>') || getTagContent(compoStr, '<style scoped>', '</style>')

//   var scoped = !!getTagContent(compoStr, '<style scoped>', '</style>')
//   output.styleScoped = scoped
//   return output
// }

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

// if (!window['babel-umd']) {
//   window['babel-umd'] = true
//   var umd = require('babel-plugin-transform-es2015-modules-umd')
//   Babel.registerPlugin('transform-es2015-modules-umd', umd)
// }
// if (!window['babel-amd']) {
//   window['babel-amd'] = true
//   var amd = require('babel-plugin-transform-es2015-modules-amd')
//   Babel.registerPlugin('transform-es2015-modules-amd', amd)
// }

// var commonjs = require('babel-plugin-transform-es2015-modules-commonjs')
// Babel.registerPlugin('transform-es2015-modules-commonjs', commonjs)

// var es6 = [
//   // [ 'transform-object-rest-spread', { 'useBuiltIns': true } ],
//   // [
//   //   'transform-es2015-modules-umd',
//   //   {
//   //     exactGlobals: true
//   //   }
//   // ],
//   [
//     'transform-es2015-modules-amd'
//   ]
//   // [
//   //   "transform-modules-commonjs", {
//   //     "allowTopLevelThis": true
//   //   }
//   // ]
// ]

// var compileEach = ({ path, src }) => {
//   return new Promise((resolve) => {
//     var output

//     try {
//       if (path.split('.').pop() === 'js') {
//         // js
//         output = Babel.transform(src, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
//         resolve({ output })
//       } else if (path.split('.').pop() === 'json') {
//         // json
//         output = Babel.transform(`export default ${JSON.stringify(JSON.parse(src))};`, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
//         resolve({ output })
//       } else if (path.split('.').pop() === 'html') {
//         // dont include html in the js file
//         output = ''
//         resolve({ output })
//       } else if (path.split('.').pop() === 'css') {
//         // text
//         let css = JSON.stringify(src)
//         let code = `
//           var css = ${css};
//           var head = document.head || document.getElementsByTagName('head')[0];
//           var style = document.createElement('style');
//           style.type = 'text/css';
//           if (style.styleSheet) {
//             style.styleSheet.cssText = css;
//           } else {
//             style.appendChild(document.createTextNode(css));
//           }
//           head.appendChild(style);
//         `

//         output = Babel.transform(code + `export default ` + css, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
//         resolve({ output })
//       } else if (path.split('.').pop() === 'vue') {
//         // vue file

//         let info = getCompoInfo(src)
//         var scopeID = 'data-s-' + (Math.ceil(Math.random() * 100000)).toString(36)
//         let css = JSON.stringify(info.style)
//         info.template = info.template.replace('>', `${scopeID}>`)

//         /* eslint-disable */

//         let code = `
//           var css = ${css};
//           var head = document.head || document.getElementsByTagName('head')[0];
//           var style = document.createElement('style');
//           style.type = 'text/css';
//           if (style.styleSheet) {
//             style.styleSheet.cssText = css;
//           } else {
//             style.appendChild(document.createTextNode(css));
//           }

//           function addScope (styleElt, scopeName) {

//             function process() {

//               var sheet = styleElt.sheet;
//               var rules = sheet.cssRules;

//               for ( var i = 0; i < rules.length; ++i ) {

//                 var rule = rules[i];
//                 if ( rule.type !== 1 )
//                   continue;

//                 var scopedSelectors = [];

//                 rule.selectorText.split(/\s*,\s*/).forEach(function(sel) {

//                   scopedSelectors.push(scopeName+' '+sel);
//                   var segments = sel.match(/([^ :]+)(.+)?/);
//                   scopedSelectors.push(segments[1] + scopeName + (segments[2]||''));
//                 });

//                 var scopedRule = scopedSelectors.join(',') + rule.cssText.substr(rule.selectorText.length);
//                 sheet.deleteRule(i);
//                 sheet.insertRule(scopedRule, i);
//               }
//             }

//             try {
//               // firefox may fail sheet.cssRules with InvalidAccessError
//               process();
//             } catch (ex) {

//               if ( ex instanceof DOMException && ex.code === DOMException.INVALID_ACCESS_ERR ) {

//                 styleElt.sheet.disabled = true;
//                 styleElt.addEventListener('load', function onStyleLoaded() {

//                   styleElt.removeEventListener('load', onStyleLoaded);

//                   // firefox need this timeout otherwise we have to use document.importNode(style, true)
//                   setTimeout(function() {

//                     process();
//                     styleElt.sheet.disabled = false;
//                   });
//                 });
//                 return;
//               }

//               throw ex;
//             }
//           }

//           head.appendChild(style);
//           if (${info.styleScoped}) {
//             addScope(style, '[${scopeID}]');
//           }
//         `

//         /* eslint-enable */

//         // inject template property into the export Object
//         info.script = info.script.replace('export default {', `export default { \n\ttemplate: ${JSON.stringify(info.template)},`)

//         // console.log(info)

//         output = Babel.transform(code + info.script, { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
//         resolve({ output })
//       } else {
//         // text
//         output = Babel.transform(`export default ` + '`' + `${src}` + '`', { presets: ['es2015'], plugins: [...es6], moduleId: path }).code
//         resolve({ output })
//       }
//     } catch (e) {
//       console.log(e)
//       output = `
//         console.log(JSON.parse("${JSON.stringify(e)}"));
//       `
//       resolve({ output })
//     }
//   })
// }

// export const compilTree = async ({ packageName, dependencies, type, tree = DefaultFilesTree }) => {
//   return compileList({ packageName, dependencies, type, files: treeToFlat(tree) })
// }

// export const compileList = ({ packageName = 'default-package', dependencies, type, files = DefaultFilesList }) => {
//   files = files.map(e => {
//     e.path = path.join(`./${packageName}/`, e.path)
//     return e
//   })
//   return Promise.all(files.map((file) => {
//     return compileEach(file)
//   })).then((all) => {
//     var modulesCodes = all.reduce((accu, val) => {
//       return accu + '\n\n\n' + val.output
//     }, '')

//     let names = dependencies.map(e => e.name)
//     // + 1 means the view package

//     if (type === 'view') {
//       let result = `
//   (function(){
//     ${modulesCodes}

//     window.PACKAGE_NAME = ${JSON.stringify(packageName)};
//     window.PACKAGE_LIST = ${JSON.stringify(names)};

//     window.COMPUTE_PLATFORM_PACKAGES = window.COMPUTE_PLATFORM_PACKAGES || {}

//     window.Resources = {
//       all: window.COMPUTE_PLATFORM_PACKAGES,
//       names: window.PACKAGE_LIST,
//       onReady: () => {
//         return new Promise((resolve) => {
//           let tt = setInterval(() => {
//             let all = window.COMPUTE_PLATFORM_PACKAGES
//             let names = window.Resources.names
//             if (Object.keys(all).length === names.length) {
//               clearInterval(tt)
//               resolve()
//             }
//           })
//         })
//       },
//       ensure: (items) => {
//         return new Promise((resolve) => {
//           new loadExt(items, function() {
//             console.log("all loaded", items);
//             resolve()
//           })
//         })
//       },
//       // THREEJS: (URLs) => {
//       //   let load = (url) => new Promise((resolve) => {
//       //     define('three', [url], function (THREE) {
//       //       return THREE;
//       //     });

//       //     require(['three'], (instance3JS) => {
//       //       resolve(instance3JS)
//       //     })
//       //   })

//       //   return Promise.all(URLs.map(load)).catch(console.log)
//       //     .then(() => {
//       //       return window.THREE
//       //     })
//       // },
//       urls: new Map(),
//       scripts: (items) => {
//         return Promise.all(items.map(resourceURL =>  {
//           let getStuff = () => {
//             if (window.Resources.urls.has(resourceURL)) {
//               return Promise.resolve(window.Resources.urls.get(resourceURL))
//             }

//             return fetch(resourceURL, {
//               method: 'get'
//             })
//             .then(function(body){
//               return body.text();
//             })
//           }

//           return getStuff().then((text) => {
//             window.Resources.urls.set(resourceURL, text)
//             let appScriptBlob = new Blob([text], { type: 'text/javascript' })
//             let appScriptURL = URL.createObjectURL(appScriptBlob)
//             let script = document.createElement('script')
//             script.src = appScriptURL;
//             document.head.appendChild(script)
//           })
//         })).catch(console.log)
//       }
//     }

//     // define('three', ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r119/three.min.js'], function ( THREE ) {
//     //   window.THREE = THREE;
//     //   return THREE;
//     // });

//     // define('gpgpu', ['https://unpkg.com/three@0.119.1/examples/js/misc/GPUComputationRenderer.js'], function ( THREE ) {
//     //   // window.THREE = THREE;
//     //   console.log(THREE)
//     //   return THREE;
//     // });

//     // require(['three'], (aa) => {
//     //   require(['gpgpu'])
//     //   console.log(aa)
//     // })

//     window.Resources.onReady().then(() => {
//       require(['./' + window.PACKAGE_NAME + '/view.js'], function () {
//       });
//     })
//   }());
//   `
//       return result
//     } else if (type === 'share') {
//       let result = `
//       (function(){
//         ${modulesCodes}

//         require(['./${packageName}/share.js'], function (item) {
//           console.log(item)
//           window.COMPUTE_PLATFORM_PACKAGES = window.COMPUTE_PLATFORM_PACKAGES || {}
//           window.COMPUTE_PLATFORM_PACKAGES['${packageName}'] = item
//           window.dispatchEvent(new Event('package-loaded'))
//         });

//       }());
//       `
//       return result
//     }

//   })
// }
