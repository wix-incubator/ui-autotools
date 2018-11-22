import React from 'react';
import {editor, languages, Uri} from 'monaco-editor';
import {IFileSystem} from '@file-services/types';

const editorOptions: editor.IEditorConstructionOptions = {
  fontSize: 11,
  wordWrap: 'on',
  minimap: {enabled: false},

  // Remove everything from the gutter
  folding: false,
  glyphMargin: false,
  lineNumbers: 'off',
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0
};

export interface IEditorProps {
  className?: string;
  filePath: string;
  fs: IFileSystem;
  onChange: (newValue: string) => void;
}

function createFileModel(fs: IFileSystem, filePath: string) {
  return editor.createModel(
    fs.readFileSync(filePath),
    undefined,
    Uri.parse('file://' + filePath)
  );
}

export class Editor extends React.PureComponent<IEditorProps> {
  private domNode = React.createRef<HTMLDivElement>();
  private editor?: editor.IStandaloneCodeEditor;
  private resizeRequestId: number = 0;

  public componentDidMount() {
    languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: languages.typescript.JsxEmit.React
    });

    this.editor = editor.create(this.domNode.current!, editorOptions);
    this.editor.setModel(createFileModel(this.props.fs, this.props.filePath));
    this.editor.onDidChangeModelContent(this.handleChange);

    window.addEventListener('resize', this.handleResize);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.cancelAnimationFrame(this.resizeRequestId);
    this.editor!.dispose();
  }

  public componentDidUpdate() {
    this.editor!.getModel()!.dispose();
    this.editor!.setModel(createFileModel(this.props.fs, this.props.filePath));
  }

  public render() {
    return <div className={this.props.className} ref={this.domNode} />;
  }

  public focus() {
    this.editor!.focus();
  }

  private handleResize = () => {
    window.cancelAnimationFrame(this.resizeRequestId);
    this.resizeRequestId = window.requestAnimationFrame(
      () => this.editor!.layout()
    );
  }

  private handleChange = () => {
    const value = this.editor!.getValue();
    this.props.onChange(value);
  }
}
