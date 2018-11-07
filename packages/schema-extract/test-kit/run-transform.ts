import { transform } from '../src/file-transformer';
import { ModuleSchema } from '../src/json-schema-types';
import {createTsService } from '../src/typescript/createMemoryTsService';

export async function transformTest(source: string, moduleId: string): Promise<ModuleSchema<any>> {
    const projectName = 'someProject';
    const testedPath = '/' + projectName + '/src/tested-module';
    const testedFile = testedPath + '.ts';
    const fixture = `
    export type AType  = string;
    export class AClass{

    }
    export class AGenericClass<T,Q>{

    }`;
    const {tsService, fs} = await createTsService({
        [projectName]: {
            src: {
                'tested-module.ts': source,
                'test-assets.ts': fixture,
            },
        },

    }, [testedFile, projectName + '/src/test-assets.ts']);
    const program = tsService.getProgram();

    if (!program) {
        throw new Error(`transformTest: cannot retrieve Program for ${moduleId}`);
    }

    const chckr = program.getTypeChecker();
    return transform(chckr, program.getSourceFile(testedFile)!, '/src/' + moduleId, '/' + projectName, fs.path);
}
