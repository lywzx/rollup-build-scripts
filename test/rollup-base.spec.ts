import { expect } from 'chai';
import { parseValueToString } from '../src/constant';

describe('helper util', function () {
  it('#parseValueToString', function () {
    expect(parseValueToString()).to.be.undefined;
    expect(parseValueToString('')).to.be.undefined;
    expect(parseValueToString('*,*')).to.be.undefined;
    expect(parseValueToString('a, b, c')).to.be.eqls(['a', 'b', 'c']);
    expect(parseValueToString('a*')).to.be.eqls([/^a[a-zA-Z._-]+$/]);
    expect(parseValueToString('@package/*')).to.be.eqls([/^@package\/[a-zA-Z._-]+$/]);
    expect(parseValueToString('*nest')).to.be.eqls([/^@?[a-zA-Z._-]+nest$/]);
    expect(parseValueToString('*/core')).to.be.eqls([/^@?[a-zA-Z._-]+\/core$/]);
    expect(parseValueToString('core*c')).to.be.eqls([/^core[a-zA-Z._-]+c$/]);
  });
});
