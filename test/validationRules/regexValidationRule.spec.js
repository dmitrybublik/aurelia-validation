import {RegexValidationRule} from '../../src/validation/validation';

//No need to test empty values, they are filtered out by the "ValidationProperty" depending if they are 'notEmpty()'

describe('Tests on RegexValidationRule', () => {

    it('should be working', () => {
        var rule = new RegexValidationRule(/^\d+$/);
        expect(rule.validate('a')).toBe(false);
        expect(rule.validate('15')).toBe(true);
    });
});