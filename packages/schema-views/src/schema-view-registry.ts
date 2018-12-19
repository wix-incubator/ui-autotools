import {Schema} from './schema';
import {SchemaView} from './schema-view';
import {SchemaPredicate} from './schema-predicates';

interface IViewRegistration {
  view: SchemaView;
  predicate: SchemaPredicate;
  variant?: string;
}

export class SchemaViewRegistry {
  private views: IViewRegistration[] = [];

  public registerView(view: SchemaView, predicate: SchemaPredicate, variant?: string): void {
    this.views.unshift({view, predicate, variant});
  }

  public getViewForSchema(schema: Schema, variant?: string): SchemaView {
    const match = variant ?
      this.findView(schema, variant) || this.findView(schema) :
      this.findView(schema);

    if (match) {
      return match.view;
    }

    throw new Error('No matching view found for schema');
  }

  private findView(schema: Schema, variant?: string) {
    return this.views.find((view) =>
      view.variant === variant && view.predicate(schema)
    );
  }
}
