import ts from 'typescript';
import React from 'react';
import { IFileSystem } from '@file-services/types';
import { IBaseHost } from '@file-services/typescript';

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
}

export class Playground extends React.PureComponent<IPlaygroundProps, IPlaygroundState> {
    public state = {
        transpiledOutput: ''
    };

    public componentDidMount() {
        this.tranpileFile();
    }

    public render() {
        const { filePath, fs: { readFileSync } } = this.props;

        return (
            <>
                <textarea
                    value={readFileSync(filePath)}
                    onChange={this.onInputChange}
                    style={{ width: 500, height: 500 }}
                />
                <textarea
                    value={this.state.transpiledOutput}
                    readOnly={true}
                    style={{ width: 500, height: 500 }}
                />
                <textarea
                    value={this.getFormattedDiagnostics()}
                    readOnly={true}
                    style={{ width: 500, height: 500 }}
                />
            </>
        );
    }

    private tranpileFile() {
        this.setState({ transpiledOutput: this.getTranspiledCode() });
    }

    private onInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        this.props.fs.writeFileSync(this.props.filePath, e.target.value);
        this.forceUpdate();
        requestAnimationFrame(() => this.tranpileFile());
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

    private getFormattedDiagnostics(): string {
        const { baseHost, languageService, filePath } = this.props;
        const diagnostics = [
            ...languageService.getSyntacticDiagnostics(filePath),
            ...languageService.getSemanticDiagnostics(filePath)
        ];
        return ts.formatDiagnostics(diagnostics, baseHost);
    }
}
