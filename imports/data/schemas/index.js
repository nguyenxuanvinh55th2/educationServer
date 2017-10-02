import { mergeStrings } from 'gql-merge';
import rootSchema from './rootSchema.js'
const typeDefs = mergeStrings([rootSchema]);
export default typeDefs;
