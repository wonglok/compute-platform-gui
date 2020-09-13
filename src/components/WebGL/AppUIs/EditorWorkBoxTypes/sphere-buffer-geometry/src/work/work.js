export const use = async ({ box, work }) => {
  let { Color } = box.deps.THREE
  let { workspaces } = box
  let myspace = {}
  workspaces.set(work._id, myspace)

  console.log('context of run time', box)
  box.scene.background = new Color('#ffbaba')
}