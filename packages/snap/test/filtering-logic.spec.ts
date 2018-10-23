import { expect } from 'chai';
import {filterLogicModule} from '../src/generate-snapshots/generate-snapshots';

const snapshot = 'thing.snapshot.ts';
const mockModule = {
  reasons: [
    {
      module: {
        type: '',
        resource: 'thing.ts'
      }
    },
    {
      module: {
        type: '',
        resource: snapshot
      }
    }
  ]
};

const mockModuleTwoLogic = {
  reasons: [
    {
      module: {
        type: '',
        resource: 'thing.ts'
      }
    },
    {
      module: {
        type: 'blah',
        resource: 'thing2.ts'
      }
    },
    {
      module: {
        type: '',
        resource: snapshot
      }
    }
  ]
};

describe('Filtering the logic module', () => {
  it('should return the snapshot file and not the logic file', () => {
    const snapshotFile = filterLogicModule(mockModule);
    expect(snapshotFile.resource).to.equal(snapshot);
  });

  it('should return the snapshot file and not the logic file when there are multiple logic files', () => {
    const snapshotFile = filterLogicModule(mockModuleTwoLogic);
    expect(snapshotFile.resource).to.equal(snapshot);
  });
});
