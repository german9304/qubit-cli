const _ = require('lodash')
const { expect } = require('chai')
const pkgService = require('../../src/services/pkg')
const pkgFixture = require('../fixtures//pkg.json')
const experienceFixture = require('../fixtures//experience.json')
const variationsFixture = require('../fixtures//variations.json')

describe('pkgService', () => {
  let experience, variations, pkg
  beforeEach(() => {
    experience = _.cloneDeep(experienceFixture)
    variations = _.cloneDeep(variationsFixture)
    pkg = _.cloneDeep(pkgFixture)
  })

  describe('getCode', function () {
    it('should build a package.json file from an experience and its variations', () => {
      expect(JSON.parse(pkgService.getCode(experience, variations)['package.json'])).to.eql(pkgFixture)
    })
  })

  describe('setCode', () => {
    it('should modify an experience object appropriately given a package.json', () => {
      let files = {}
      pkg.meta.name = 'new-name'
      pkg.meta.previewUrl = 'new-url'
      let expected = _.cloneDeep(experience)
      expected.name = pkg.meta.name
      expected.recent_iterations.draft.url = pkg.meta.previewUrl
      files['package.json'] = JSON.stringify(pkg)
      delete pkg.meta
      expected.recent_iterations.draft.package_json = JSON.stringify(pkg, null, 2)
      expect(pkgService.setCode(experience, files)).to.eql(expected)
    })
  })
})
