const chalk = require('chalk')
let confirm = require('confirmer')

module.exports = async function shouldRemove (name) {
  if (!/\.(css|js)$/.test(name)) return false
  const msg = `Do you want ${chalk.green.bold('xp')} to remove ${chalk.green.bold(name)}?`
  let result = await confirm(msg)
  if (process) {
    process.stdout.moveCursor(0, -1)
    process.stdout.clearScreenDown()
  }
  return result
}
