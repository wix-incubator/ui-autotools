import {  Schema } from '../src/json-schema-types';
import { SchemaLinker } from '../src/file-linker';
import {createTsProgram } from '../src/typescript/createMemoryTsProgram';
import { IDirectoryContents} from '@file-services/types';
export async function linkTest(sourceDir: IDirectoryContents, entityName: string, fileName: string): Promise<Schema> {
    const projectName = 'someProject';
    const projectPath = `/${projectName}`;
    const testedPath = projectPath + '/src/';
    const testedFile = testedPath + fileName;
    const {program} = await createTsProgram({
        [projectName]: {
            src: sourceDir,
        },
    }, [testedFile]);
    const linker = new SchemaLinker(program, projectPath);

    return linker.flatten(testedFile, entityName);
}
