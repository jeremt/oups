import Ajv from 'ajv';
const ajv = new Ajv({removeAdditional: true});

export const verifyAddClient = ajv.compile({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {type: 'string'},
        address: {type: 'string'},
        email: {type: 'string'},
        company_id: {type: 'string'},
    },
    required: ['name', 'address', 'company_id'],
});

export const verifyUpdateClient = ajv.compile({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {type: 'string'},
        address: {type: 'string'},
        email: {type: 'string'},
        company_id: {type: 'string'},
    },
});
