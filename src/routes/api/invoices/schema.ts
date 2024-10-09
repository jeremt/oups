import Ajv from 'ajv';
const ajv = new Ajv({ removeAdditional: true });

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
		lines: {
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
		},
		number: {
			type: 'number'
		},
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
		'number',
		'organisation_id',
		'quantity_label'
	]
});
