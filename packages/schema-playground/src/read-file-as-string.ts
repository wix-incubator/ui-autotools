import fs from 'fs';

export default (path: string) => fs.readFileSync(require.resolve(path), 'utf8');
