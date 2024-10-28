const foldAccents = (str: string): string => {
    return str
        .replace(/[áàãâä]/gi, 'a')
        .replace(/[éèëê]/gi, 'e')
        .replace(/[íìïî]/gi, 'i')
        .replace(/[óòöôõ]/gi, 'o')
        .replace(/[úùüû]/gi, 'u')
        .replace(/[ç]/gi, 'c')
        .replace(/[ñ]/gi, 'n');
};

const stringContains = (str: string, query: string, commutative: boolean): boolean => {
    return str.indexOf(query) !== -1 || (commutative && query.indexOf(str) !== -1);
};

export const queryFilter = (value: string | string[], query: string, commutative: boolean = false): boolean => {
    if (Array.isArray(value)) {
        for (const str of value) {
            const match =
                stringContains(str, query, commutative) ||
                stringContains(str.toLocaleLowerCase(), query.toLocaleLowerCase(), commutative) ||
                stringContains(foldAccents(str), query, commutative) ||
                stringContains(foldAccents(str.toLocaleLowerCase()), query.toLocaleLowerCase(), commutative);
            if (match) {
                return true;
            }
        }
        return false;
    }
    return (
        stringContains(value, query, commutative) ||
        stringContains(value.toLocaleLowerCase(), query.toLocaleLowerCase(), commutative) ||
        stringContains(foldAccents(value), query, commutative) ||
        stringContains(foldAccents(value.toLocaleLowerCase()), query.toLocaleLowerCase(), commutative)
    );
};
