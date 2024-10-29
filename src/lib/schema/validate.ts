import Ajv from 'ajv';
import type {JsonSchema} from '$lib/schema/schema';
import type {InferJsonSchema} from '$lib/schema/infer';

const ajv = new Ajv({removeAdditional: true});

export const createValidator = <T extends JsonSchema>(schema: T) => {
    return ajv.compile<InferJsonSchema<T>>(schema);
};
