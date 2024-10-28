import {describe, it, expect} from 'vitest';
import {queryFilter} from './queryFilter';

describe('search', () => {
    it('should test some search queries', () => {
        expect(queryFilter('Jonathan', 'jon')).to.be.equals(true);
        expect(queryFilter('Jonathan', 'vince')).to.be.equals(false);
        expect(queryFilter('Les amis du théâtre', 'les amis du theatr')).to.be.equals(true);
    });
    it('should test search queries commutativity', () => {
        expect(queryFilter('Jonathan', 'jon')).to.be.equals(true);
        expect(queryFilter('jon', 'Jonathan')).to.be.equals(false);
        expect(queryFilter('Jonathan', 'jon', true)).to.be.equals(true);
        expect(queryFilter('jon', 'Jonathan', true)).to.be.equals(true);
    });
    it('should test some search queries with array as parameter', () => {
        expect(queryFilter(['Vincent', 'Jonathan'], 'jon')).to.be.equals(true);
        expect(queryFilter(['Vincent', 'Jeremie'], 'jon')).to.be.equals(false);
    });
});
