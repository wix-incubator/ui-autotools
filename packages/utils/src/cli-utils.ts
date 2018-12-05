import dotenv from 'dotenv';
import { registerRequireHooks } from './';
import path from 'path';

export function cliInit(): void {
    dotenv.config();
    registerRequireHooks();
}

export const defaultMetaGlob = 'src/**/*.meta.ts?(x)';
export function getWebpackConfigPath(projectPath: string): string {
    return path.join(projectPath, '.autotools/webpack.config.js');
}
