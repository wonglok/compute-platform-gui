// long version
function loadExt(files, after) {
  var _this=this;
  _this.files = files;
  _this.js = [];
  _this.head = document.getElementsByTagName("head")[0];
  _this.after = after || function(){};
  _this.loadStyle = function(file) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = file;
    _this.head.appendChild(link);
  };
  _this.loadScript = function(i) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = _this.js[i];
    var loadNextScript = function() {
      if (++i < _this.js.length) _this.loadScript(i);
      else _this.after();
    };
    script.onload = function() { loadNextScript() };
    _this.head.appendChild(script);
  }
  for (var i=0;i<_this.files.length;i++) {
    if (/\.js$|\.js\?/.test(_this.files[i])) _this.js.push(_this.files[i])
    if (/\.css$|\.css\?/.test(_this.files[i])) _this.loadStyle(_this.files[i])
  }
  if (_this.js.length>0) _this.loadScript(0);
  else _this.after();
}

// // minified version (651B, and 336B with gzip)
// function loadExt(e,t){var s=this;s.files=e,s.js=[],s.head=document.getElementsByTagName("head")[0],s.after=t||function(){},s.loadStyle=function(e){var t=document.createElement("link");t.rel="stylesheet",t.type="text/css",t.href=e,s.head.appendChild(t)},s.loadScript=function(e){var t=document.createElement("script");t.type="text/javascript",t.src=s.js[e];var a=function(){++e<s.js.length?s.loadScript(e):s.after()};t.onload=function(){a()},s.head.appendChild(t)};for(var a=0;a<s.files.length;a++)/\.js$|\.js\?/.test(s.files[a])&&s.js.push(s.files[a]),/\.css$|\.css\?/.test(s.files[a])&&s.loadStyle(s.files[a]);s.js.length>0?s.loadScript(0):s.after()}

// // to use it
// new loadExt(["/path/file1.js","/path/file1.css", "file2.js?nocache="+(new Date().getTime()), "file3.js"], function() {
//   console.log("all loaded");
// })

