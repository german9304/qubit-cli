const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const input = require('../lib/input')
const getPkg = require('../lib/get-pkg')
const formatLog = require('../lib/format-log')
const readFiles = require('../lib/read-files')
const scaffold = require('../lib/scaffold')
const { STYLE_EXTENSION } = require('../constants')
const log = require('../lib/log')

let CWD = process.cwd()

module.exports = async function templatize () {
  try {
    let pkg = await getPkg()

    let tmpPkg = _.extend({}, pkg, { version: '1.0.0', main: 'index.js', meta: {} })

    tmpPkg.name = clean(await input.text(formatLog('   What would you like to call your template?'), { default: pkg.name || 'template' }))

    tmpPkg.description = await input.text(formatLog('   Please provide a description:'))

    let templateDir = path.join(path.dirname(CWD), tmpPkg.name)

    await fs.ensureDir(path.join(templateDir, 'template'))

    let files = await readFiles(CWD)

    if (pkg.meta) {
      addTemplateVariables(files, pkg)
      _.each(pkg.meta.variations, (variation, filename) => {
        files['variation.js'] = files[`${filename}.js`]
        files[`variation${STYLE_EXTENSION}`] = files[`${filename}${STYLE_EXTENSION}`]
        delete files[`${filename}.js`]
        delete files[`${filename}${STYLE_EXTENSION}`]
      })
    }

    delete files['package.json']

    log.info(`...creating template at ${templateDir}`)

    await scaffold(path.join(templateDir, 'template'), files, false, true, true)

    await fs.writeFile(path.join(templateDir, 'package.json'), JSON.stringify(tmpPkg, null, 2))
    await fs.writeFile(path.join(templateDir, 'template/package.json'), JSON.stringify(tmpPkg, null, 2))

    await fs.writeFile(path.join(templateDir, 'index.js'), '')

    await execa('npm', ['link'], { cwd: templateDir })

    log.info(`Your template is npm linked and ready to use!`)
  } catch (err) {
    log.error(err)
  }
}

function addTemplateVariables (files, pkg) {
  _.each(files, (file, filename) => {
    _.each(['propertyId', 'experienceId', 'iterationId'], (key) => {
      if (pkg.meta[key]) files[filename] = addTemplateVariable(pkg.meta, file, key)
    })
    _.each(pkg.meta.variations, (variation) => {
      _.each(['variationId', 'variationMasterId'], (key) => {
        if (variation[key]) files[filename] = addTemplateVariable(variation, file, key)
      })
    })
  })
}

function addTemplateVariable (meta, file, key) {
  if (!meta[key]) return file
  if (String(meta[key]).length <= 3) return file
  return file.replace(new RegExp(meta[key], 'g'), `<%= ${key} %>`)
}

function clean (name) {
  return name
    .toLowerCase()
    .replace(/^(@[^/]+\/)?(?:xp-tmp-)?(.*)/, (full, scope, name) => (scope || '') + 'xp-tmp-' + name)
    .replace(/[^@a-z0-9/]/g, '-')
}
