const _ = require('lodash')
const yaml = require('js-yaml')
const fs = require('fs-extra')
let { QUBITRC } = require('./constants')
let inMemory = false
let data

async function read () {
  try {
    if (!inMemory) {
      data = parse(String(await fs.readFile(QUBITRC)))
      inMemory = true
    }
    return data
  } catch (err) {
    return {}
  }
}

async function write (newData) {
  let output = newData
  data = newData
  return fs.writeFile(QUBITRC, serialize(output))
}

function get (key) {
  return read()
    .then(result => result[getEnv()] || {})
    .then(result => result[key])
}

async function set (key, value) {
  return read().then(currentData => {
    let env = getEnv()
    currentData[env] = currentData[env] || {}
    Object.assign(currentData[env], { [key]: value })
    return write(currentData)
  })
}

async function unset (key) {
  return read().then(currentData => {
    let env = getEnv()
    currentData[env] = currentData[env] || {}
    delete currentData[env][key]
    return write(currentData)
  })
}

async function unsetEnv () {
  return read().then(currentData => {
    let env = getEnv()
    delete currentData[env]
    return write(currentData)
  })
}

function getEnv () {
  // note: this isn't wrong. the default environment for Qubit-CLI is production
  return process.env.NODE_ENV || 'production'
}

function parse (value) {
  return _.pick(value ? yaml.load(value) : {}, ['debug', 'staging', 'production', 'test'])
}

function serialize (things) {
  return yaml.dump(things)
}

module.exports = { get, set, unset, unsetEnv }