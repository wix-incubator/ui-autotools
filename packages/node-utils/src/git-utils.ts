import {execSync} from 'child_process';

const branchNameCommand = 'git rev-parse --abbrev-ref HEAD';
const PULL_REQUEST_PARENT_HASH_INDEX = 2;
const HEAD_HASH_INDEX = 0;

export function getBranchName() {
  return execSync(branchNameCommand).toString();
}

export function getHeadHash() {
  return execSync('git rev-parse --verify HEAD').toString();
}

export function getParentsHashArray() {
  const headCommitHash = getHeadHash();
  return execSync(`git rev-list --parents -n 1 ${headCommitHash}`).toString().split(' ');
}

export function getPRHeadHash() {
  const parentsHashArr = getParentsHashArray();
  const isPullRequest = parentsHashArr.length === 3;
  const parentHashIndex = isPullRequest ? PULL_REQUEST_PARENT_HASH_INDEX : HEAD_HASH_INDEX;
  return parentsHashArr[parentHashIndex].trim();
}
