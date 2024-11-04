export type Api = {
    '/': [
        {
            method: 'GET';
            returnType: {
                age: number;
                email: string;
                isAdmin: false | true;
                status: 'generated' | 'sent' | 'accepted' | 'declined' | 'paid' | 'declared';
                arr: (string | number)[];
                clients: {id: number; createdAt: Date; updatedAt: Date; name: string; address: string; email: null | string; logoUrl: null | string; companyId: number}[];
            };
        },
    ];
    '/api/clients/': [
        {
            method: 'GET';
            returnType: {id: number; createdAt: Date; updatedAt: Date; name: string; address: string; email: null | string; logoUrl: null | string; companyId: number}[];
        },
        {
            method: 'POST';
            returnType: undefined | {id: number; createdAt: Date; updatedAt: Date; name: string; address: string; email: null | string; logoUrl: null | string; companyId: number};
        },
    ];
    '/api/clients/[id]/': [
        {
            method: 'PATCH';
            returnType: {id: number; createdAt: Date; updatedAt: Date; name: string; address: string; email: null | string; logoUrl: null | string; companyId: number};
        },
        {
            method: 'DELETE';
            returnType: Record<string, never>;
        },
    ];
    '/api/companies/': [
        {
            method: 'GET';
            returnType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                address: string;
                email: string;
                logoUrl: null | string;
                bic: string;
                iban: string;
                siren: string;
                phone: null | string;
                quoteSequence: number;
                invoiceSequence: number;
            }[];
        },
        {
            method: 'POST';
            returnType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                address: string;
                email: string;
                logoUrl: null | string;
                bic: string;
                iban: string;
                siren: string;
                phone: null | string;
                quoteSequence: number;
                invoiceSequence: number;
            };
        },
    ];
    '/api/companies/[id]/': [
        {
            method: 'PATCH';
            returnType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                address: string;
                email: string;
                logoUrl: null | string;
                bic: string;
                iban: string;
                siren: string;
                phone: null | string;
                quoteSequence: number;
                invoiceSequence: number;
            };
        },
        {
            method: 'DELETE';
            returnType: Record<string, never>;
        },
    ];
    '/api/documents/': [
        {
            method: 'POST';
            returnType: {id: number};
        },
    ];
    '/api/documents/[id]/': [
        {
            method: 'PUT';
            returnType:
                | undefined
                | {
                      number: number;
                      id: number;
                      createdAt: Date;
                      updatedAt: Date;
                      name: string;
                      companyId: number;
                      type: 'invoice' | 'quote';
                      organizationId: null | number;
                      status: 'generated' | 'sent' | 'accepted' | 'declined' | 'paid' | 'declared';
                      clientId: number;
                      emittedAt: Date;
                      lines: {price: number; quantity: undefined | number; description: string}[];
                      note: null | string;
                      quantityBase: number;
                      quantityLabel: string;
                      discountPrice: number;
                      depositPercent: number;
                  };
        },
        {
            method: 'DELETE';
            returnType: Record<string, never>;
        },
        {
            method: 'GET';
            returnType:
                | undefined
                | {
                      id: number;
                      number: number;
                      createdAt: Date;
                      updatedAt: Date;
                      name: string;
                      companyId: number;
                      type: 'invoice' | 'quote';
                      organizationId: null | number;
                      status: 'generated' | 'sent' | 'accepted' | 'declined' | 'paid' | 'declared';
                      clientId: number;
                      emittedAt: Date;
                      lines: {price: number; quantity: undefined | number; description: string}[];
                      note: null | string;
                      quantityBase: number;
                      quantityLabel: string;
                      company: {
                          id: number;
                          createdAt: Date;
                          updatedAt: Date;
                          name: string;
                          address: string;
                          email: string;
                          logoUrl: null | string;
                          bic: string;
                          iban: string;
                          siren: string;
                          phone: null | string;
                          quoteSequence: number;
                          invoiceSequence: number;
                      };
                      client: {id: number; createdAt: Date; updatedAt: Date; name: string; address: string; email: null | string; logoUrl: null | string; companyId: number};
                  };
        },
    ];
    '/api/documents/company/[id]/': [
        {
            method: 'GET';
            returnType: {
                number: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                companyId: number;
                type: 'invoice' | 'quote';
                organizationId: null | number;
                status: 'generated' | 'sent' | 'accepted' | 'declined' | 'paid' | 'declared';
                clientId: number;
                emittedAt: Date;
                lines: {price: number; quantity: undefined | number; description: string}[];
                note: null | string;
                quantityBase: number;
                quantityLabel: string;
                discountPrice: number;
                depositPercent: number;
            }[];
        },
    ];
    '/api/documents/new/': [
        {
            method: 'GET';
            returnType:
                | undefined
                | {
                      id: number;
                      quoteSequence: number;
                      invoiceSequence: number;
                      client: {id: number; createdAt: Date; updatedAt: Date; name: string; address: string; email: null | string; logoUrl: null | string; companyId: number};
                  };
        },
    ];
};
