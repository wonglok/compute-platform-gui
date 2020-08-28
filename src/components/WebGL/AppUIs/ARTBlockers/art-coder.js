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
        type: 'update',
        data: {
          name: 'angleInc',
          modification: 'add-by',
          value: '0.1'
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
      displayName: 'Recycle Bin',
      type: 'recycle bin',
      children: [
      ]
    },
    vertex: {
      displayName: 'Vertex Shader',
      type: 'vertex',
      children: [
        {
          id: rID(),
          group: 'system',
          put: false,
          pull: false,
          type: 'vec4',
          displayName: `Vertex Input`,
          data: {
            name: 'dataInput',
            init: 'defaultPosition',
          }
        },

        // {
        //   id: rID(),
        //   put: true,
        //   pull: true,
        //   type: 'select',
        //   displayName: `Select Vector Component`,
        //   data: {
        //     name: 'selected',
        //     select: 'xyz',
        //     variableName: 'dataInput',
        //   }
        // },


        {
          id: rID(),
          group: 'system',
          put: false,
          pull: false,
          type: 'output',
          displayName: `Vertex Output`,
          data: {
            name: 'dataOutput',
            variableName: 'dataInput'
          }
        }
      ]
    },
    fragment: {
      displayName: 'Fragment Shader',
      type: 'fragment',
      children: [
        {
          id: rID(),
          group: 'system',
          put: false,
          pull: false,
          type: 'vec4',
          displayName: `Fragment Input`,
          data: {
            name: 'dataInput',
            init: 'defaultColor',
          }
        },
        {
          id: rID(),
          group: 'system',
          put: false,
          pull: false,
          type: 'output',
          displayName: `Fragment Output`,
          data: {
            name: 'dataOutput',
            variableName: 'dataInput'
          }
        }
      ]
    }
  }
}
export const fromSelectToType = (select) => {
  if (select.length === 1) {
    return 'float'
  } else if (select.length === 2) {
    return 'vec2'
  } else if (select.length === 3) {
    return 'vec3'
  } else if (select.length === 4) {
    return 'vec4'
  } else {
    return ''
  }
}

export const make = () => {
  var state = {
    nest: {}
  }
  var api = {
    state,

    // getVariableMod (child, id) {
    //   var indent = state.nest[id]

    //   var operand = '='
    //   var mod = child.data.modification
    //   if (mod === 'add-by') {
    //     operand = '+='
    //   }
    //   if (mod === 'subtract-by') {
    //     operand = '-='
    //   }
    //   if (mod === 'multiply-by') {
    //     operand = '*='
    //   }
    //   if (mod === 'divided-by') {
    //     operand = '/='
    //   }

    //   if (mod === 'set-to') {
    //     operand = '='
    //   }

    //   var str = indent + `${child.data.name} ${operand} ${child.data.value};`
    //   str += '\n'

    //   return str
    // },

    getVariableInitFloat (child, id) {
      var indent = state.nest[id]

      var str = indent + `float ${child.data.name} = ${child.data.init};`
      str += '\n'

      return str
    },

    // getMoverUsePlane (child, id) {
    //   var indent = state.nest[id]

    //   var str = indent + `mover2D.usePlane('${child.data.usePlane}');`
    //   str += '\n'

    //   return str
    // },
    // getMoverTurnBy (child, id) {
    //   var indent = state.nest[id]

    //   var str = indent + `mover2D.turnBy(${child.data.amount});`
    //   str += '\n'

    //   return str
    // },
    // getMoverMove (child, id) {
    //   var indent = state.nest[id]

    //   var str = indent + `mover2D.moveBy(${child.data.amount});`
    //   str += '\n'

    //   return str
    // },

    getRepeat (child, id, ctx) {
      var indent = state.nest[id]

      var str = indent + 'var n_' + child.id + ' = ' + child.data.times + '; \n'
      str += indent + `for (let i = 0; i < n_${child.id}; i++) {`

      str += indent + '\n'

      str += this.getCode(child, id, ctx)

      str += indent + '\n'

      str += indent + `}\n`
      return str
    },

    getSampler2D (child, id, ctx) {
      var indent = state.nest[id]

      var str = indent + `${child.data.variableName} = texture2D(${child.data.sampler2DName}, ${child.data.uv});`
      str += '\n'

      return str
    },

    getFloat (child, id, ctx) {
      var indent = state.nest[id]

      var str = indent + `float ${child.data.name} = ${child.data.init};`
      str += '\n'

      return str
    },

    getVec2 (child, id, ctx) {
      var indent = state.nest[id]

      var str = indent + `vec2 ${child.data.name} = ${child.data.init};`
      str += '\n'

      return str
    },

    getVec3 (child, id, ctx) {
      var indent = state.nest[id]

      var str = indent + `vec3 ${child.data.name} = ${child.data.init};`
      str += '\n'

      return str
    },

    getVec4 (child, id, ctx) {
      var indent = state.nest[id]

      var str = indent + `vec4 ${child.data.name} = ${child.data.init};`
      str += '\n'

      return str
    },

    selectCompos (child, id, ctx) {
      var indent = state.nest[id]

      var str = ''

      str += indent + `${fromSelectToType(child.data.select)} ${child.data.name} = ${child.data.variableName}.${child.data.select};`

      str += '\n'

      return str
    },

    getRotateX (child, id, ctx) {
      var indent = state.nest[id]

      var str = ''

      let codeAmount = child.data.amount
      if (!isNaN(child.data.amount)) {
        codeAmount = Number(child.data.amount).toFixed(5)
      }

      str += indent + `${child.data.variableName}.${child.data.select} = rotateX(${(codeAmount)}) * ${child.data.variableName}.${child.data.select};`

      str += '\n'

      return str
    },

    getRotateY (child, id, ctx) {
      var indent = state.nest[id]

      var str = ''
      let codeAmount = child.data.amount
      if (!isNaN(child.data.amount)) {
        codeAmount = Number(child.data.amount).toFixed(5)
      }

      str += indent + `${child.data.variableName}.${child.data.select} = rotateY(${(codeAmount)}) * ${child.data.variableName}.${child.data.select};`

      str += '\n'

      return str
    },

    getRotateZ (child, id, ctx) {
      var indent = state.nest[id]

      var str = ''

      let codeAmount = child.data.amount
      if (!isNaN(child.data.amount)) {
        codeAmount = Number(child.data.amount).toFixed(5)
      }

      str += indent + `${child.data.variableName}.${child.data.select} = rotateZ(${(codeAmount)}) * ${child.data.variableName}.${child.data.select};`

      str += '\n'

      return str
    },

    getOutputCode (child, id, ctx) {
      var indent = state.nest[id]

      var str = indent + `${child.data.name} = ${child.data.variableName};`
      str += '\n'

      return str
    },

    getCode (child, id, ctx) {
      state.nest[id] = state.nest[id] || ''
      var str = child.children.reduce((accu, item, key) => {
        state.nest[id] += '\t'

        if (item.type === 'repeat') {
          accu += this.getRepeat(item, id, ctx)
        }

        if (item.type === 'sampler2D') {
          accu += this.getSampler2D(item, id, ctx)
        }

        if (item.type === 'float') {
          accu += this.getFloat(item, id, ctx)
        }

        if (item.type === 'vec2') {
          accu += this.getVec2(item, id, ctx)
        }
        if (item.type === 'vec3') {
          accu += this.getVec3(item, id, ctx)
        }
        if (item.type === 'vec4') {
          accu += this.getVec4(item, id, ctx)
        }

        if (item.type === 'output') {
          accu += this.getOutputCode(item, id, ctx)
        }

        if (item.type === 'select') {
          accu += this.selectCompos(item, id, ctx)
        }

        if (item.type === 'rotateX') {
          accu += this.getRotateX(item, id, ctx)
        }

        if (item.type === 'rotateY') {
          accu += this.getRotateY(item, id, ctx)
        }

        if (item.type === 'rotateZ') {
          accu += this.getRotateZ(item, id, ctx)
        }

        // if (item.type === 'mover2D.moveBy') {
        //   accu += this.getMoverMove(item, id)
        // }
        // if (item.type === 'mover2D.turnBy') {
        //   accu += this.getMoverTurnBy(item, id)
        // }
        // if (item.type === 'mover2D.usePlane') {
        //   accu += this.getMoverUsePlane(item, id)
        // }
        // if (item.type === 'variable') {
        //   accu += this.getVariableInit(item, id)
        // }
        // if (item.type === 'update') {
        //   accu += this.getVariableMod(item, id)
        // }

        state.nest[id] = state.nest[id].replace('\t', '')
        return accu
      }, '')

      console.log(str)
      return str
    }
  }

  return api
}
