const { expect } = require('chai');
const User = require('./models/user');
const Role = require('./models/role');
const ProxyValidator = require('../index');

describe('Validator', () => {

  it('can set initial properties to empty object', () => {
    expect(() => new User({})).not.to.throw();
  });

  it('throws if calling "validate" on empty object', () => {
    expect(() => new User().validate()).to.throw(TypeError, /must be a non empty string/);
  });

  it('can use normal "getters"', () => {
    const user = new User({
      firstName: 'first',
      lastName: 'last'
    });

    expect(user.fullName).to.equal('first last');
  });

  it('can use normal "toString()"', () => {
    const string = new User({
      firstName: 'first',
      lastName: 'last'
    }).toString();

    expect(string).to.equal('[object Object]');
  });

  it('serialize removes internal properties (validationFields)', () => {
    const user = new User({
      firstName: 'first',
      lastName: 'last'
    });

    expect(user.validationFields).to.be.an('object');
    expect('validationFields' in user).to.equal(true);

    const copy = JSON.parse(JSON.stringify(user));
    expect(copy.validationFields).to.equal(undefined);
    expect(copy.firstName).to.equal('first');
    expect(copy.lastName).to.equal('last');
  });

  describe('validate()', () => {
    let options;

    beforeEach(() => {
      options = {
        ignoreUndefinedProperties: true,
        allowExtraProperties: true
      };
    });

    it('will ignore undefined properties', () => {
      const user = new User({
        firstName: 'first'
      });

      expect(() => user.validate(options.ignoreUndefinedProperties))
        .not.to.throw();
    });

    it('will ignore undefined properties, but validate existing', () => {
      let user = new User({
        firstName: 1
      });

      expect(() => user.validate(options.ignoreUndefinedProperties))
        .to.throw(TypeError, /"firstName" must be a non empty string/);

      user = new User({
        firstName: '1'
      });

      expect(() => user.validate(options.ignoreUndefinedProperties))
        .to.throw(RangeError, /firstName should be between 3 and 50/);

      user = new User({
        lastName: new Array(51).fill('x').join('')
      });

      expect(user.lastName).to.have.lengthOf(51);
      expect(() => user.validate(options.ignoreUndefinedProperties))
        .to.throw(RangeError, /lastName should be between 3 and 50/);
    });

    it('will ignore extra fields', () => {
      const role = new Role({
        name: 'first',
        extra: 'field'
      });

      const { ignoreUndefinedProperties, allowExtraProperties } = options;

      expect(() => role.validate(ignoreUndefinedProperties))
        .to.throw(TypeError, /Only fields: name is allowed/);


      expect(() => role.validate(ignoreUndefinedProperties, allowExtraProperties))
        .not.to.throw();

      expect(role.extra).to.equal('field');
    });

    it('passes if all fields are set', () => {
      const role = new Role({ name: 'test' });
      delete role.extra;

      const user = new User({
        firstName: 'Name',
        lastName: 'Lastname',
        email: 'user@example.com',
        postalCode: 55625,
        roles: [role],
        groups: ['group1', 'group2', 'group3']
      });

      expect(() => user.validate()).not.to.throw();
    });

    describe('Setters', () => {
      it('validates when properties are set', () => {
        const user = new User();

        expect(() => {
          user.firstName = 'x';
        }).to.throw(RangeError, /firstName should be between 3 and 50/);

        expect(() => {
          user.email = 1;
        }).to.throw(TypeError, /must be a non empty string/);

        expect(() => {
          user.unknown = 1;
        }).to.throw(Error, /Missing field: unknown/);

        expect(() => {
          user.created = 'string';
        }).to.throw(TypeError, 'Expected created to be a number');

        expect(() => {
          user.groups = ['1'];
        }).to.throw(RangeError, 'groups[0] should be between 3 and 10');

        expect(() => {
          user.groups = ['group0', 'g'];
        }).to.throw(RangeError, 'groups[1] should be between 3 and 10');

        expect(() => {
          user.roles = [user];
        }).to.throw(TypeError, 'roles[] can only contain Role');

        expect(() => {
          user.groups = ['group0'];
        }).not.to.throw();
      });
    });

    describe('Plain objects', () => {
      it('can create validator without extending ProxyValidator', () => {
        const emptyFieldRule = {
          validate(value, field, name) {
            if (value !== '') {
              throw new TypeError(`Expected field "${name}" to be empty`);
            }
          }
        };

        const emptyStringObject = ProxyValidator.from(
          { empty: 'not empty' },
          { empty: emptyFieldRule });

        expect(() => emptyStringObject.validate())
          .to.throw(TypeError, 'Expected field "empty" to be empty');
      });

      it('should not overwrite existing methods', () => {
        const validationField = {
          validate() { }
        };

        expect(() => {
          ProxyValidator.from({ validate: '' }, { empty: validationField });
        }).to.throw(TypeError, /Property "validate" is a reserved property in the validator/);

        expect(() => {
          ProxyValidator.from({ initializeValidation: '' }, { empty: validationField });
        }).to.throw(TypeError, /Property "initializeValidation" is a reserved property in the validator/);
      });

      it('can enable validation when creating a new instance', () => {
        const validationField = {
          validate() {
            throw new Error('expected');
          }
        };

        const initializeValidation = true;

        expect(() => {
          ProxyValidator.from({ expected: 1 }, { expected: validationField }, initializeValidation);
        }).to.throw(Error, /expected/);
      });
    });
  });
});
