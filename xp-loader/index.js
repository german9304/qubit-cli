module.exports = function loader (content) {
  return 'module.exports = ' + content
    .replace(/(^|[^\.])require\(/g, '$1window.__qubit.amd.require(')
    .replace(/window\.__qubit\.amd\.require\(['"]@qubit\/remember\-preview['"]/, "require('no-op'")
}
