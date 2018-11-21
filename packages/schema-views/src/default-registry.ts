import {SchemaViewRegistry} from './schema-view-registry';
import * as predicates from './schema-predicates';
import * as views from './views';

const registry = new SchemaViewRegistry();

registry.registerView(views.FallbackTypeView, predicates.catchAll);
registry.registerView(views.FunctionTypeView, predicates.isFunction);
registry.registerView(views.UnionTypeView, predicates.isUnion);
registry.registerView(views.ObjectTypeView, predicates.isObject);
registry.registerView(views.InterfaceTypeView, predicates.isInterface);
registry.registerView(views.ArrayTypeView, predicates.isArray);
registry.registerView(views.StringTypeView, predicates.isString);
registry.registerView(views.NumberTypeView, predicates.isNumber);
registry.registerView(views.BooleanTypeView, predicates.isBoolean);
registry.registerView(views.UndefinedTypeView, predicates.isUndefined);
registry.registerView(views.NullTypeView, predicates.isNull);
registry.registerView(views.AnyTypeView, predicates.isAny);

export const defaultSchemaViewRegistry = registry;
