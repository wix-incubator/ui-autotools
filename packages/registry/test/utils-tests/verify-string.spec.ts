import {isValidSimulationTitle, isValidComponentName} from '../../src';
import {expect} from 'chai';

describe('Verification Methods', () => {
  describe('isValidSimulationTitle', () => {
    it('returns true for an valid string', () => {
      const goodString = 'TestMe123';

      expect(isValidSimulationTitle(goodString)).to.equal(true);
    });

    it('should return false for an invalid string', () => {
      const badString = '$test-props';

      expect(isValidSimulationTitle(badString)).to.equal(false);
    });
  });

  describe('isValidComponentName', () => {
    it('returns true for an valid string', () => {
      const goodString = 'MyFavoriteCompWithANiceProperName';

      expect(isValidComponentName(goodString)).to.equal(true);
    });

    it('should return false for an invalid string', () => {
      const badString = 'Shamefully Named-comp024';

      expect(isValidComponentName(badString)).to.equal(false);
    });
  });
});
