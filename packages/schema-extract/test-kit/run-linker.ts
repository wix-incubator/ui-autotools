import {  Schema } from '../src/json-schema-types';
import { SchemaLinker } from '../src/file-linker';
import {createTsService } from '../src/typescript/createMemoryTsService';
import { IDirectoryContents} from '@file-services/types';
export async function linkTest(sourceDir: IDirectoryContents, entityName: string, fileName: string): Promise<Schema> {
    const projectName = 'someProject';
    const projectPath = `/${projectName}`;
    const testedPath = projectPath + '/src/';
    const testedFile = testedPath + fileName;
    const {tsService, fs} = await createTsService({
        [projectName]: {
            src: sourceDir,
        },
    }, [testedFile]);
    const program = tsService.getProgram()!;
    const linker = new SchemaLinker(program, projectPath, fs.path);

    return linker.flatten(testedFile, entityName);
}
