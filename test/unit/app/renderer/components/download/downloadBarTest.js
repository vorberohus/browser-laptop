/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global describe, before, after, it */

const mockery = require('mockery')
const {mount} = require('enzyme')
const assert = require('assert')
const fakeElectron = require('../../../../lib/fakeElectron')
const path = require('path')
const uuid = require('uuid')
const Immutable = require('immutable')
const downloadStates = require('../../../../../../js/constants/downloadStates')
require('../../../../braveUnit')

const mostRecentlyDownloadedId = uuid.v4()

const appStoreRenderer = Immutable.fromJS({
  downloads: {
    [uuid.v4()]: {
      startTime: new Date().getTime(),
      filename: 'mostHatedPrimes.txt',
      savePath: path.join(require('os').tmpdir(), 'mostHatedPrimes.txt'),
      url: 'http://www.bradrichter.com/mostHatedPrimes.txt',
      totalBytes: 104729,
      receivedBytes: 96931,
      state: downloadStates.IN_PROGRESS
    },
    [mostRecentlyDownloadedId]: {
      startTime: new Date().getTime() + 1000,
      filename: 'compositeNumbersFTW.txt',
      savePath: path.join(require('os').tmpdir(), 'compositeNumbersFTW.txt'),
      url: 'http://www.bradrichter.com/compositeNumbersTW.txt',
      totalBytes: 42,
      receivedBytes: 1024,
      state: downloadStates.COMPLETED
    },
    [uuid.v4()]: {
      startTime: new Date().getTime() - 1000,
      filename: 'guideToIntegers.txt',
      savePath: path.join(require('os').tmpdir(), 'guideToInegers.txt'),
      url: 'http://www.bradrichter.com/guideToInegers.txt',
      totalBytes: 72,
      receivedBytes: 1,
      state: downloadStates.IN_PROGRESS
    }
  }
})

describe('downloadsBar component', function () {
  let DownloadItem, DownloadsBar, appStore

  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    })
    mockery.registerMock('electron', fakeElectron)
    DownloadItem = require('../../../../../../app/renderer/components/download/downloadItem')
    DownloadsBar = require('../../../../../../app/renderer/components/download/downloadsBar')
    appStore = require('../../../../../../js/stores/appStoreRenderer')
    appStore.state = appStoreRenderer
  })

  after(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  describe('multiple downloads with space', function () {
    before(function () {
      this.result = mount(<DownloadsBar />)
    })

    it('renders each download as a DownloadItem', function () {
      assert.equal(this.result.find(DownloadItem).length, 3)
    })

    it('renders more recent items first', function () {
      assert.equal(this.result.find(DownloadItem).at(0).props().downloadId, mostRecentlyDownloadedId)
    })

    it('hide downloads button is shown', function () {
      assert.equal(this.result.find('[data-test-id="hideDownloadsToolbar"]').length, 1)
    })
  })

  describe('no downloads', function () {
    before(function () {
      appStore.state = Immutable.fromJS({
        downloads: {}
      })
      this.result = mount(<DownloadsBar />)
    })

    it('renders no DownloadItems when there are no downloads', function () {
      assert.equal(this.result.find(DownloadItem).length, 0)
    })

    it('hide downloads button is shown', function () {
      assert.equal(this.result.find('[data-test-id="hideDownloadsToolbar"]').length, 1)
    })
  })

  // skipped until #9176 is merged
  describe.skip('very narrow downloads bar with items', function () {
    before(function () {
      mockery.registerMock('../../getComputedStyle', () => 10)
      this.result = mount(<DownloadsBar />)
    })
    it('renders no downloads', function () {
      assert.equal(this.result.find(DownloadItem).length, 0)
    })

    it('but still shows hide downloads button', function () {
      assert.equal(this.result.find('[data-test-id="hideDownloadsToolbar"]').length, 1)
    })
  })
})
