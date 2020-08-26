let rID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export const makeTools = () => {
  return {
    type: 'tools',
    put: false,
    pull: 'clone',
    children: [
      {
        id: rID(),
        put: true,
        pull: true,
        type: 'variable',
        data: {
          name: 'angleInc',
          init: '0'
        }
      },
      {
        id: rID(),
        put: true,
        pull: true,
        type: 'update',
        data: {
          name: 'angleInc',
          modification: 'add-by',
          value: '0.1'
        }
      },
      {
        id: rID(),
        put: true,
        pull: true,
        type: 'mover2D.usePlane',
        data: {
          usePlane: 'xy'
        }
      },
      {
        id: rID(),
        put: true,
        pull: true,
        type: 'mover2D.moveBy',
        data: {
          amount: 1
        }
      },
      {
        id: rID(),
        put: true,
        pull: true,
        type: 'mover2D.turnBy',
        data: {
          amount: 1
        }
      },
      {
        id: rID(),
        put: false,
        pull: false,
        type: 'repeat',
        data: {
          times: 5
        },
        children: [
          {
            id: rID(),
            put: false,
            pull: false,
            type: 'mover2D.moveBy',
            data: {
              amount: 1
            }
          }
        ]
      }
    ]
  }
}

export const makeTemplate = () => {
  return {
    tree: {
      type: 'program entry point',
      children: [

      ]
    }
  }
}

export const makeDemo1 = () => {
  return {
    bin: {
      type: 'recycle bin',
      children: [
      ]
    },
    tree: {
      type: 'program entry point',
      children: [
        {
          id: rID(),
          put: true,
          pull: true,
          type: 'variable',
          data: {
            name: 'angleInc',
            init: '0'
          }
        },
        {
          id: rID(),
          put: true,
          pull: true,
          type: 'repeat',
          data: {
            times: 500
          },
          children: [
            {
              id: rID(),
              put: true,
              pull: true,
              type: 'update',
              data: {
                name: 'angleInc',
                modification: 'add-by',
                value: '0.1'
              }
            },
            {
              id: rID(),
              put: true,
              pull: true,
              type: 'mover2D.turnBy',
              data: {
                amount: 'angleInc'
              }
            },
            {
              id: rID(),
              put: true,
              pull: true,
              type: 'mover2D.moveBy',
              data: {
                amount: 1
              }
            }
          ]
        }
      ]
    }
  }
}

export const make = () => {
  var state = {
    nest: {}
  }
  var api = {
    state,

    getVariableMod (child, id) {
      var indent = state.nest[id]

      var operand = '='
      var mod = child.data.modification
      if (mod === 'add-by') {
        operand = '+='
      }
      if (mod === 'subtract-by') {
        operand = '-='
      }
      if (mod === 'multiply-by') {
        operand = '*='
      }
      if (mod === 'divided-by') {
        operand = '/='
      }

      if (mod === 'set-to') {
        operand = '='
      }

      var str = indent + `${child.data.name} ${operand} ${child.data.value};`
      str += '\n'

      return str
    },
    getVariableInit (child, id) {
      var indent = state.nest[id]

      var str = indent + `var ${child.data.name} = ${child.data.init};`
      str += '\n'

      return str
    },

    getMoverUsePlane (child, id) {
      var indent = state.nest[id]

      var str = indent + `mover2D.usePlane('${child.data.usePlane}');`
      str += '\n'

      return str
    },
    getMoverTurnBy (child, id) {
      var indent = state.nest[id]

      var str = indent + `mover2D.turnBy(${child.data.amount});`
      str += '\n'

      return str
    },
    getMoverMove (child, id) {
      var indent = state.nest[id]

      var str = indent + `mover2D.moveBy(${child.data.amount});`
      str += '\n'

      return str
    },
    getRepeat (child, id) {
      var indent = state.nest[id]

      var str = indent + 'var n_' + child.id + ' = ' + child.data.times + '; \n'
      str += indent + `for (let i = 0; i < n_${child.id}; i++) {`

      str += indent + '\n'

      str += this.getCode(child, id)

      str += indent + '\n'

      str += indent + `}\n`
      return str
    },
    getCode (child, id) {
      state.nest[id] = state.nest[id] || ''
      var str = child.children.reduce((accu, item, key) => {
        state.nest[id] += '\t'

        if (item.type === 'repeat') {
          accu += this.getRepeat(item, id)
        }
        if (item.type === 'mover2D.moveBy') {
          accu += this.getMoverMove(item, id)
        }
        if (item.type === 'mover2D.turnBy') {
          accu += this.getMoverTurnBy(item, id)
        }
        if (item.type === 'mover2D.usePlane') {
          accu += this.getMoverUsePlane(item, id)
        }
        if (item.type === 'variable') {
          accu += this.getVariableInit(item, id)
        }
        if (item.type === 'update') {
          accu += this.getVariableMod(item, id)
        }

        state.nest[id] = state.nest[id].replace('\t', '')
        return accu
      }, '')

      console.log(str)
      return str
    }
  }

  return api
}
