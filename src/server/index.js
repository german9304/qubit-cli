const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const bodyParser = require('body-parser')
const createEmitter = require('event-kitten')
const up = require('../cmd/up')
const log = require('../lib/log')
const config = require('../../webpack.conf')

module.exports = function start (options) {
  let emitter = createEmitter()
  if (options.sync) {
    log('watching for changes')
    emitter.on('rebuild', up)
  }
  config.plugins = config.plugins || []
  config.plugins.push(new webpack.DefinePlugin({
    __WAIT__: !!options.require,
    __VARIATIONJS__: "'" + 'xp-loader!' + options.variation.replace(/\.js$/, '') + "'",
    __VARIATIONCSS__: "'" + options.variation.replace(/\.js$/, '.css') + "'"
  }))
  if (!options.sync && !options.watch) config.entry.pop()
  let compiler = webpack(config)
  compiler.plugin('done', (data) => emitter.emit('rebuild', data))
  let server = new WebpackDevServer(compiler, Object.assign(config.devServer, {
    https: options.certs
  }))
  server.app.use(bodyParser.json())
  server.app.post('/connect', require('./routes/connect'))
  return {server, emitter}
}
