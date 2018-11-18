import {execSync} from 'child_process';

const branchNameCommand = 'git rev-parse --abbrev-ref HEAD';

export function getBranchName() {
  return execSync(branchNameCommand).toString();
}
