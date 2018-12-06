import {getPRHeadHash} from '@ui-autotools/node-utils';

export function setApplitoolsBatchId() {
  let batchId;
  try {
    batchId = getPRHeadHash();
  } catch (e) {
    // Set batchID to the teamcity environment variable indicating the
    // latest VCS revision included in the build for the root identified
    batchId = process.env.BUILD_VCS_NUMBER;
  }

  return batchId;
}
