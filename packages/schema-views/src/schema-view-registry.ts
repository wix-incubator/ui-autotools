import {Schema} from './schema';
import {SchemaView} from './schema-view';
import {SchemaPredicate} from './schema-predicates';

export class SchemaViewRegistry {
  private views: Array<{view: SchemaView, predicate: SchemaPredicate}> = [];

  public registerView(view: SchemaView, predicate: SchemaPredicate): void {
    this.views.unshift({view, predicate});
  }

  public getViewForSchema(schema: Schema): SchemaView {
    const match = this.views.find(({predicate}) => predicate(schema));
    if (match) {
      return match.view;
    }
    throw new Error('No matching view found for schema');
  }
}
