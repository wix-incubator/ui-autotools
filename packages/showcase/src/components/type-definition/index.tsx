import * as React from 'react';
import style from './type-definition.st.css';

// The idea is for the child nodes to be able to tell to their parents how much
// space they occupy when formatted as an inline element or as a block, e.g.:
//
// Inline:
//   {firstName: string, lastName: string}
//
// Block:
//   {
//     firstName: string,
//     lastName: string
//   }
//
// And the parent would decide based on that information how to arrange the
// children and which version of each child to use.

interface IRenderedType {
  inline?: {
    length: number;
    content: React.ReactNode;
    canWrap?: boolean;
  };
  block?: {
    length: number;
    content: React.ReactNode;
  };
}

interface ITypeRendererState {
  availableInlineSpace: number;
  availableBlockSpace: number;
}

interface ITypeRendererSettings {
  tabSize: number;
}

type TypeRenderer = (
  schema: any,
  state: ITypeRendererState,
  settings: ITypeRendererSettings
) => IRenderedType;

function intersperse<T>(items: T[], separator: T) {
  const result = [];
  for (const item of items) {
    result.push(item);
    result.push(separator);
  }
  result.pop();
  return result;
}

function getInlineOrBlockContent(type: IRenderedType): React.ReactNode {
  return type.inline ? type.inline.content : type.block!.content;
}

function renderLiteral(literal: string): IRenderedType {
  return {
    inline: {
      length: literal.length,
      content: literal
    }
  };
}

// TODO: unions are really like sequences of inline blocks, if one of the
// elements is a block it needs to be on a separate line, otherwise elements
// should wrap naturally. Not sure about array though.
const joinUnionElements = (
  elements: IRenderedType[],
  state: ITypeRendererState,
  settings: ITypeRendererSettings
): IRenderedType => {
  const values = elements.map(getInlineOrBlockContent);
  return {
    inline: {
      length: 0,
      canWrap: true,
      content: React.Children.toArray(intersperse(values, ' | '))
    }
  };
};

const renderUniformUnion: TypeRenderer = (schema, state, settings) => {
  const parts = schema.enum.map(JSON.stringify).map(renderLiteral);
  return joinUnionElements(parts, state, settings);
};

const renderUnion: TypeRenderer = (schema, state, settings) => {
  const parts = schema.$oneOf.map((itemSchema: any) => (
    itemSchema.enum ?
      itemSchema.enum.map(JSON.stringify).map(renderLiteral) :
      [renderType(itemSchema, state, settings)]
  ));

  return joinUnionElements([].concat(...parts), state, settings);
};

// TODO: rest args, generic args
const renderFunction: TypeRenderer = (schema, state, settings) => {
  const returns = (
    schema.returns.$ref === 'common/undefined' ?
      'void' :
      getInlineOrBlockContent(renderType(schema.returns, state, settings))
  );

  const args = schema.arguments.map((arg: any) =>
    [arg.name + ': ', getInlineOrBlockContent(renderType(arg, state, settings))]
  );

  const combinedArgs = React.Children.toArray(intersperse(args, ', '));

  return {
    inline: {
      length: 0,
      content: <>({combinedArgs}) => {returns}</>
    }
  };
};

const renderUnknown: TypeRenderer = (schema) => {
  const value: string = (
    schema.$ref ||
    schema.definedAt ||
    schema.type ||
    JSON.stringify(schema)
  );

  return {
    inline: {
      length: value.length,
      content: <span className={style.typeError}>{value}</span>
    }
  };
};

const renderType: TypeRenderer = (schema, state, settings) => {
  if (Object.keys(schema).length === 0) {
    return renderLiteral('any');
  }

  if (schema.enum) {
    return renderUniformUnion(schema, state, settings);
  }

  if (schema.type === 'boolean') {
    return renderLiteral('boolean');
  }

  if (schema.type === 'number') {
    return renderLiteral('number');
  }

  if (schema.type === 'string') {
    return renderLiteral('string');
  }

  if (schema.$oneOf) {
    return renderUnion(schema, state, settings);
  }

  if (schema.$ref === 'common/null') {
    return renderLiteral('null');
  }

  if (schema.$ref === 'common/undefined') {
    return renderLiteral('undefined');
  }

  if (
    schema.$ref === 'common/function' ||
    schema.$ref === 'common/class_constructor'
  ) {
    return renderFunction(schema, state, settings);
  }

  return renderUnknown(schema, state, settings);
};

export interface ITypeDefinitionProps {
  schema: any;
  maxLineLength: number;
  tabSize: number;
}

export const TypeDefinition: React.SFC<ITypeDefinitionProps> = ({
  schema, maxLineLength, tabSize
}) => {
  const renderedType = renderType(
    schema, {
      availableInlineSpace: maxLineLength,
      availableBlockSpace: maxLineLength
    }, {
      tabSize
    }
  );

  const children =
    renderedType.inline && renderedType.block ?
      renderedType.inline.length < maxLineLength ?
        renderedType.inline.content :
        renderedType.block.content
      :
      getInlineOrBlockContent(renderedType);

  return <div>{children}</div>;
};
