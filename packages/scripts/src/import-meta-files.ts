import glob from 'glob';

export function importMetaFiles(projectPath: string, metaGlob: string): void {
  glob.sync(metaGlob, { absolute: true, cwd: projectPath }).forEach(require);
}
