import { IDirectoryContents } from '@file-services/types';

let tsRecipe: IDirectoryContents;
let rRecipe: IDirectoryContents;
export async function getRecipies(): Promise<IDirectoryContents[]> {
    if (!tsRecipe) {
        const { typescriptRecipe } =
        await import('./recipes/typescript' /* webpackChunkName: 'typescript-recipe' */);
        tsRecipe = typescriptRecipe;
    }
    if (!rRecipe) {
        const { reactRecipe } =
        await import('./recipes/react' /* webpackChunkName: 'react-recipe' */);
        rRecipe = reactRecipe;
    }
    return [tsRecipe, rRecipe];
}
