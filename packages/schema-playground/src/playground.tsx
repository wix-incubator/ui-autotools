import ts from 'typescript';
import React from 'react';
import { IFileSystem } from '@file-services/types';
import { IBaseHost } from '@file-services/typescript';
import { transform } from '@ui-autotools/schema-extract/esm/file-transformer';

import 'sanitize.css';
import './playground.css';

export interface IPlaygroundProps {
    fs: IFileSystem;
    baseHost: IBaseHost;
    languageService: ts.LanguageService;
    filePath: string;
}

export interface IPlaygroundState {
    transpiledOutput: string;
    schema: string;
}

export class Playground extends React.PureComponent<IPlaygroundProps, IPlaygroundState> {
    public state = {
        transpiledOutput: '',
        schema: ''
    };

    public componentDidMount() {
        this.transpileFile();
    }

    public render() {
        const { filePath, fs: { readFileSync } } = this.props;

        return (
            <>
                <textarea
                    spellCheck={false}
                    value={readFileSync(filePath)}
                    onChange={this.onInputChange}
                    style={{ width: 500, height: 500 }}
                />
                <textarea
                    spellCheck={false}
                    value={this.state.transpiledOutput}
                    readOnly={true}
                    style={{ width: 500, height: 500 }}
                />
                <textarea
                    spellCheck={false}
                    value={this.state.schema}
                    readOnly={true}
                    style={{ width: 500, height: 500 }}
                />
            </>
        );
    }

    private transpileFile() {
        const transpiledOutput = this.getTranspiledCode();
        const program = this.props.languageService.getProgram();
        const typeChecker = program && program.getTypeChecker();
        const sourceFile = program && program.getSourceFile(this.props.filePath);
        if (typeChecker && sourceFile) {
            const schema = JSON.stringify(transform(typeChecker, sourceFile, this.props.filePath, '/'), null, 2);
            this.setState({ transpiledOutput, schema });
        } else {
            this.setState({ transpiledOutput });
        }

    }

    private onInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        this.props.fs.writeFileSync(this.props.filePath, e.target.value);
        this.forceUpdate();
        requestAnimationFrame(() => this.transpileFile());
    }

    private getTranspiledCode(): string {
        const { languageService, filePath } = this.props;
        const { outputFiles } = languageService.getEmitOutput(filePath);
        const [jsFile] = outputFiles.filter((outputFile) => outputFile.name);

        if (!jsFile) {
            throw new Error('Cannot find transpiled .js file');
        }
        return jsFile.text;
    }

    // private getFormattedDiagnostics(): string {
    //     const { baseHost, languageService, filePath } = this.props;
    //     const diagnostics = [
    //         ...languageService.getSyntacticDiagnostics(filePath),
    //         ...languageService.getSemanticDiagnostics(filePath)
    //     ];
    //     return ts.formatDiagnostics(diagnostics, baseHost);
    // }
}
