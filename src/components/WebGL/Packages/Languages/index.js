export const status = {
  lang: 'en',
  langs: [
    {
      key: 'tc',
      icon: `🇭🇰`
    },
    {
      key: 'sc',
      icon: `🇨🇳`
    },
    {
      key: 'en',
      icon: `🇬🇧`
    }
  ]
}

if (/^zh\b/.test(navigator.language)) {
  status.lang = 'tc'
}

// if (/^zh-CN\b/.test(navigator.language)) {
//   status.lang = 'sc'
// }

if (/^en\b/.test(navigator.language)) {
  status.lang = 'en'
}

export const getLang = (type) => {
  let proxy = new Proxy({}, {
    get: (obj, key) => {
      let data = []
      if (type === 'genesis') {
        data = require('./genesis.js').default
      }
      let item = data.find(e => e.key === key)
      if (item) {
        return item[status.lang]
      } else {
        console.log('not found', status.lang, key)
        return ''
      }
    },
    set: (obj, key, val) => {
      console.log('there no setter. read only')
    }
  })

  return proxy
}
