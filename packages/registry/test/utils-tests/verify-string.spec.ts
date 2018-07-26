import {isAlphanumeric} from '../../src';
import {expect} from 'chai';

describe('Verification Methods', () => {
  describe('isAlphanumeric', () => {
    it('returns true for an alphanumeric string', () => {
      const goodString = 'TestMe123';

      expect(isAlphanumeric(goodString)).to.equal(true);
    });

    it('should return false for a string with bad values', () => {
      const badString = '$test-comp';

      expect(isAlphanumeric(badString)).to.equal(false);
    });
  });
});
