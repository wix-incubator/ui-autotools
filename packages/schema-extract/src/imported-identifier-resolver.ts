import * as ts from 'typescript';
export type IFileSystemPath = import ('@file-services/types').IFileSystem['path'];

export function resolveImportedIdentifier(node: ts.Node, modulePath: string, posix: IFileSystemPath) {
    if (ts.isNamespaceImport(node)) {
        const target = node.parent!.parent!.moduleSpecifier.getText().slice(1, -1);
        return resolveImportPath(target, '', modulePath, posix);
    } else if (ts.isImportSpecifier(node)) {
        const target = node.parent!.parent!.parent!.moduleSpecifier.getText().slice(1, -1);
        return resolveImportPath(target,  '#' + node.getText(), modulePath, posix);

    } else if (ts.isImportClause(node)) {
        const target = node.parent!.moduleSpecifier.getText().slice(1, -1);
        return resolveImportPath(target,  '#default', modulePath, posix);
    }
    return null;
}

export function resolveImportPath(relativeUrl: string, importInternal: string, modulePath: string, posix: IFileSystemPath) {
    if (relativeUrl.startsWith('.') || relativeUrl.startsWith('/')) {
        const currentDir = posix.dirname(modulePath);
        const resolvedPath = posix.join(currentDir, relativeUrl);

        return resolvedPath + importInternal;
    }

    return relativeUrl + importInternal;
}
