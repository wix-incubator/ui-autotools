import { expect } from 'chai';
import { isValidSimulationTitle, isValidComponentName } from '@ui-autotools/registry';

describe('Verification Methods', () => {
  describe('isValidSimulationTitle', () => {
    it('returns true for an valid string', () => {
      const goodString = 'TestMe-123_ and a space';

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

    it('should return valid for a name with a dot', () => {
      const validString = 'Shamefully.Named';

      expect(isValidComponentName(validString)).to.equal(true);
    });
  });
});
