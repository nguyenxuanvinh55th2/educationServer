import { merge } from 'lodash';

import NonScalars from './nonScalars';
import Mutation from './mutations';
import Query from './queries';

export default merge({},NonScalars, {Query: Query}, {Mutation: Mutation});
