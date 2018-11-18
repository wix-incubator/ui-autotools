import {execSync} from 'child_process';

const PULL_REQUEST_PARENT_HASH_INDEX = 2;
const HEAD_HASH_INDEX = 0;

function getHeadHash() {
  return execSync('git rev-parse --verify HEAD').toString();
}

function getParentsHashArray() {
  const headCommitHash = getHeadHash();
  return execSync(`git rev-list --parents -n 1 ${headCommitHash}`).toString().split(' ');
}

function getPRHeadHash() {
  const parentsHashArr = getParentsHashArray();
  const isPullRequest = parentsHashArr.length === 3;
  const parentHashIndex = isPullRequest ? PULL_REQUEST_PARENT_HASH_INDEX : HEAD_HASH_INDEX;
  return parentsHashArr[parentHashIndex].trim();
}

export function setApplitoolsId() {
  let batchId;
  try {
    batchId = getPRHeadHash();
  } catch (e) {
    batchId = process.env.BUILD_VCS_NUMBER;
  }
  process.env.APPLITOOLS_BATCH_ID = batchId;
}
