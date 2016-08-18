const co = require('co')
const path = require('path')
const {expect} = require('chai')
const fixtures = path.join(__dirname, 'fixtures/tree')
const readFiles = require('../src/lib/read-files')

describe('read-files', function () {
  it('should create a key value object of all the files in a dir', co.wrap(function * () {
    expect(yield readFiles(fixtures)).to.eql({
      'a.js': '1\n',
      'b.js': '2\n',
      'c': {
        'd.js': '3\n'
      }
    })
  }))
})
