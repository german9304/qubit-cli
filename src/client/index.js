/* globals __VARIATIONJS__, __VARIATIONCSS__ */
var amd = require('./amd')
var engine = require('./engine')
var options = require('./options')
var key = __VARIATIONCSS__.replace(/\.css$/, '')
var opts = options(require('package.json'), key)

window.__qubit = window.__qubit || {}
window.__qubit.amd = amd()
init()

function init () {
  engine(opts, globalFn, triggerFn, variationFn)
}

function globalFn () {
  require('global')
}

function triggerFn (opts, cb) {
  return require('triggers')(opts, cb)
}

function variationFn (opts) {
  require(__VARIATIONCSS__)
  var api = require(__VARIATIONJS__)(opts)
  if (api && api.remove) {
    module.hot.accept()
    module.hot.dispose(function () {
      api.remove()
    })
  } else {
    module.hot.decline()
  }
}
