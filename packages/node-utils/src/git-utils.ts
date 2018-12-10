import {execSync} from 'child_process';

const PULL_REQUEST_PARENT_HASH_INDEX = 2;
const HEAD_HASH_INDEX = 0;

export function getBranchName() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString();
}

export function getHeadHash() {
  return execSync('git rev-parse --verify HEAD').toString();
}

export function getParentsHashArray() {
  const headCommitHash = getHeadHash();
  return execSync(`git rev-list --parents -n 1 ${headCommitHash}`).toString().split(' ');
}

// This code is not understood and is magical. Use or refactor with caution
export function getPRHeadHash() {
  const parentsHashArr = getParentsHashArray();
  const isPullRequest = parentsHashArr.length === 3;
  const parentHashIndex = isPullRequest ? PULL_REQUEST_PARENT_HASH_INDEX : HEAD_HASH_INDEX;
  return parentsHashArr[parentHashIndex].trim();
}
