export const enableESC = {
  mounted () {
    this.$root.escs = this.$root.escs || []
    this.cancel = () => {
      this.$emit('overlay', false)
      this.$emit('mouse-mode', '')
    }
    this.$root.escs.push(this.cancel)
  },
  beforeDestroy () {
    let idx = this.$root.escs.indexOf(this.cancel)
    if (idx !== -1) {
      this.$root.escs.splice(idx, 1)
    }
  }
}