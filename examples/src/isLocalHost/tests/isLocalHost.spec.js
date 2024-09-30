import {
    provisionFakeBrowserURILocationForTests_withAddons
  } from '../../../../index';
  
  import {
    isLocalHost
  } from '../';
  
  describe('Tests for isLocalHost() function', () => {
    const {
      $setWindowOrigin_forThisTestCase
    } = provisionFakeBrowserURILocationForTests_withAddons()
  
    it('should return `false` if page host isn\'t localhost', () => {
      $setWindowOrigin_forThisTestCase('https://example.com')
  
      expect(isLocalHost()).toBe(false)
    });
  
    it('should return `true` if page host is localhost', () => {
      $setWindowOrigin_forThisTestCase('http://localhost')
  
      expect(isLocalHost()).toBe(true)
    })
  })