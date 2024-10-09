import Ajv from 'ajv';
const ajv = new Ajv({ removeAdditional: true });

const linesSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			description: {
				type: 'string'
			},
			price: {
				type: 'number'
			}
		},
		required: ['description', 'price']
	}
};
export const verifyAddInvoice = ajv.compile({
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	additionalProperties: false,
	properties: {
		name: {
			type: 'string'
		},
		client_id: {
			type: 'string'
		},
		company_id: {
			type: 'string'
		},
		emission_date: {
			type: 'string',
			format: 'date'
		},
		lines: linesSchema,
		organisation_id: {
			type: 'string'
		},
		quantity_label: {
			type: 'string'
		}
	},
	required: [
		'client_id',
		'company_id',
		'emission_date',
		'lines',
		'name',
		'organisation_id',
		'quantity_label'
	]
});

export const verifyUpdateInvoice = ajv.compile({
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	additionalProperties: false,
	properties: {
		status: { type: 'string', enum: ['generated', 'sent', 'paid', 'declared'] },
		company_id: { type: 'string' },
		client_id: { type: 'string' },
		organization_id: { type: 'string' },
		emission_date: { type: 'string', format: 'date' },
		name: { type: 'string' },
		lines: linesSchema,
		quantity_label: { type: 'string' }
	}
});
