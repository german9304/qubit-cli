const chalk = require('chalk')
const codeService = require('../services/code')
const log = require('./log')
const readFiles = require('./read-files')
const jsdiff = require('diff')

module.exports = async function checkDiff (cwd, propertyId, experienceId) {
  log.info('Comparing files...')
  const files = await codeService.get(propertyId, experienceId)
  const localFiles = await readFiles(cwd)
  delete files['package.json']
  delete localFiles['package.json']
  const fileDiffs = jsDiffCheck(localFiles, files)

  if (fileDiffs.length) {
    log.info('Showing diff between local and remote files...')
    for (let diffObj of fileDiffs) {
      const { fileName, diff } = diffObj
      log.info(`${chalk.blue.bold(fileName)} \n`)
      diff.forEach(parts => {
        const color = parts.added ? 'green' : parts.removed ? 'red' : 'grey'
        log.info(`${chalk[color](parts.value)}`)
      })
    }
  } else {
    log.info('Both versions are the same!')
  }

  function jsDiffCheck (localFiles, files) {
    let diffs = []
    for (let name in files) {
      const remoteVal = clean(files[name] || '')
      const localVal = clean(localFiles[name] || '')
      if (remoteVal !== localVal) {
        const diff = jsdiff.diffTrimmedLines(remoteVal, localVal, [{ ignoreWhitespace: true }])
        diffs.push({fileName: name.toUpperCase(), diff: diff})
      }
    }
    return diffs
  }

  function clean (str) {
    return str.trim()
  }
}
