export interface JsonSchemaAll<T> {
    const?: T;
    default?: T;
    //
    title?: string;
    description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface JsonSchemaAny extends JsonSchemaAll<any> {
    type?: never;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface JsonSchemaAnyOf extends JsonSchemaAll<any> {
    type?: never;
    anyOf: JsonSchema[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface JsonSchemaArray extends JsonSchemaAll<any[]> {
    type: 'array';
    items?: JsonSchema;
}

export interface JsonSchemaObject extends JsonSchemaAll<object> {
    type: 'object';
    required?: string[];
    properties?: Record<string, JsonSchema>;
    additionalProperties?: boolean | JsonSchema;
}

export interface JsonSchemaNumber extends JsonSchemaAll<number> {
    type: 'number';
}

export interface JsonSchemaString extends JsonSchemaAll<string> {
    type: 'string';
    format?: string;
    placeholder?: string;
    //
    enum?: string[];
    enumLabels?: string[];
    //
    minLength?: number;
    maxLength?: number;
}

export interface JsonSchemaBoolean extends JsonSchemaAll<boolean> {
    type: 'boolean';
}

export interface JsonSchemaNull extends JsonSchemaAll<null> {
    type: 'null';
}

export type JsonSchema = JsonSchemaAnyOf | JsonSchemaAny | JsonSchemaArray | JsonSchemaObject | JsonSchemaNumber | JsonSchemaString | JsonSchemaBoolean | JsonSchemaNull;
