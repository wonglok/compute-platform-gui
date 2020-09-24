export const getConnsDirect = async ({ work, arrows, works, workspaces }) => {
  return new Promise((resolve, reject) => {
    let itemA = work
    let arrowABs = arrows.filter(e => e.from === itemA._id)

    let root = []
    arrowABs.forEach((arrowAB) => {
      if (arrowAB) {
        let tout = setInterval(() => {
          let itemB = works.find(e => e._id === arrowAB.to)
          if (itemB) {
            let api = workspaces.get(itemB._id)
            if (itemB && api) {
              clearInterval(tout)
              root.push({
                api,
                work: itemB
              })
            }
          }
        })
      }
    })

    let ttout = setInterval(() => {
      if (root.length === arrowABs.length) {
        clearInterval(ttout)
        resolve(root)
      }
    })
  })
}

export const getConnsReverse = async ({ work, arrows, works, workspaces }) => {
  return new Promise((resolve, reject) => {
    let itemA = work
    let arrowABs = arrows.filter(e => e.from === itemA._id)

    let root = []
    arrowABs.forEach((arrowAB) => {
      if (arrowAB) {
        let tout = setInterval(() => {
          let itemB = works.find(e => e._id === arrowAB.to)
          if (itemB) {
            let api = workspaces.get(itemB._id)
            if (itemB && api) {
              clearInterval(tout)
              root.push({
                api,
                work: itemB
              })
            }
          }
        })
      }
    })

    let ttout = setInterval(() => {
      if (root.length === arrowABs.length) {
        clearInterval(ttout)
        resolve(root)
      }
    })
  })
}

export const getConns = async ({ work, arrows, works, workspaces, key = false }) => {
  let arr = await getConnsDirect({ work, arrows, works, workspaces })
  if (key) {
    arr = arr.filter(e => e.api[key])
    console.log('key', key, arr)
  }
  if (arr.length <= 0) {
    arr = await getConnsReverse({ work, arrows, works, workspaces })
  }
  return arr
}
