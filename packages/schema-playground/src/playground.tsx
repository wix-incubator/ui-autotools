import ts from 'typescript';
import React from 'react';
import {IFileSystem} from '@file-services/types';
import {IBaseHost} from '@file-services/typescript';
import {transform} from '@ui-autotools/schema-extract';
import {extractSchema as extractStylableSchema} from '@stylable/schema-extract';
import {BaseView as BaseSchemaView, defaultSchemaViewRegistry} from '@ui-autotools/schema-views/src';
import {Editor} from './editor';
import * as Session from './session';

import 'sanitize.css';
import './playground.css';

export interface IPlaygroundProps {
  fs: IFileSystem;
  baseHost: IBaseHost;
  languageService: ts.LanguageService;
  filePaths: {[key: string]: string};
}

export interface IPlaygroundState {
  fileType: string;
  schema: object;
}

export class Playground extends React.PureComponent<IPlaygroundProps, IPlaygroundState> {
  public state = {
    fileType: Session.loadSetting('fileType') || 'typescript',
    schema: {}
  };

  public componentDidMount() {
    this.updateSchema();
  }

  public render() {
    const {fs} = this.props;
    const filePath = this.getFilePath();

    return (
      <div className="playground">
        <div className="playground-pane source-code-pane">
          <select
            value={this.state.fileType}
            onChange={this.handleFileTypeChange}
          >
            <option value="typescript">TypeScript</option>
            <option value="stylable">Stylable</option>
          </select>
          <Editor
            className="source-code-editor"
            fs={fs}
            filePath={filePath}
            onChange={this.handleSourceCodeChange}
          />
        </div>
        <textarea
          className="playground-pane schema-pane"
          spellCheck={false}
          value={JSON.stringify(this.state.schema, null, 2)}
          readOnly={true}
        />
        <div className="playground-pane view-pane">
          <BaseSchemaView
            schema={this.state.schema}
            schemaRegistry={new Map()}
            viewRegistry={defaultSchemaViewRegistry}
          />
        </div>
      </div>
    );
  }

  private getFilePath() {
    return this.props.filePaths[this.state.fileType];
  }

  private handleFileTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const fileType = e.target.value;
    this.setState({fileType});
    Session.saveSetting('fileType', fileType);
    requestAnimationFrame(() => this.updateSchema());
  }

  private handleSourceCodeChange = (newValue: string) => {
    const filePath = this.getFilePath();
    this.props.fs.writeFileSync(filePath, newValue);
    Session.saveFile(filePath, newValue);
    this.forceUpdate();
    requestAnimationFrame(() => this.updateSchema());
  }

  private updateSchema() {
    if (this.state.fileType === 'typescript') {
      this.setState({schema: this.extractTypescriptSchema()});
    }
    if (this.state.fileType === 'stylable') {
      this.setState({schema: this.extractStylableSchema()});
    }
  }

  private extractTypescriptSchema() {
    const filePath = this.getFilePath();
    const program = this.props.languageService.getProgram()!;
    const typeChecker = program.getTypeChecker()!;
    const sourceFile = program.getSourceFile(filePath)!;
    const moduleSchema = transform(
      typeChecker, sourceFile, filePath, '/', this.props.fs.path
    );
    const schema = (moduleSchema.properties && moduleSchema.properties.default) ?
      moduleSchema.properties.default : moduleSchema;
    return schema;
  }

  private extractStylableSchema() {
    const {fs} = this.props;
    const filePath = this.getFilePath();
    const fileContents = fs.readFileSync(filePath);

    return extractStylableSchema(
      fileContents,
      filePath,
      '/',
      fs.path
    );
  }
}
