import * as ts from 'typescript';
import * as path from 'path';

export interface IEnv {
    modulePath: string;
    projectPath: string;
}

export function resolveImportedIdentifier(node: ts.Node, modulePath: string, posix: typeof path.posix) {
    if (ts.isNamespaceImport(node)) {
        const target = node.parent!.parent!.moduleSpecifier.getText().slice(1, -1);
        return resolveImportPath(target, '', modulePath, posix);
    } else if (ts.isImportSpecifier(node)) {
        const target = node.parent!.parent!.parent!.moduleSpecifier.getText().slice(1, -1);
        return resolveImportPath(target,  '#' + node.getText(), modulePath, posix);

    } else if (ts.isImportClause(node)) {
        const target = node.parent!.moduleSpecifier.getText().slice(1, -1);
        return resolveImportPath(target,  '#' + node.getText(), modulePath, posix);
    }
}

function resolveImportPath(relativeUrl: string, importInternal: string, modulePath: string, posix: typeof path.posix) {
    if (relativeUrl.startsWith('.') || relativeUrl.startsWith('/')) {
        const currentDir = posix.dirname(modulePath);
        const resolvedPath = posix.join(currentDir, relativeUrl);

        return resolvedPath + importInternal;
    }

    return relativeUrl + importInternal;
}
