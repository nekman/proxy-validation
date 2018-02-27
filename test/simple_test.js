const { expect } = require('chai');
const Validator = require('../index');
const { StringValidator } = require('../lib/validators');

describe('Simple', () => {

  const UserValidationFields = {
    firstName: {
      min: 3,
      max: 10,
      validate: StringValidator.validateField
    },
    email: {
      regexp: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
      min: 5,
      max: 200,
      // Custom (naive) validation method.
      validate(value, field, propertyName) {
        StringValidator.validateField(value, field, propertyName);
        if (!field.regexp.test(value)) {
          throw new TypeError(`Expected ${propertyName} to be a email address`);
        }
      }
    }
  };

  class User extends Validator(UserValidationFields) {
    constructor() {
      super();
      return super.initializeValidation();
    }
  }

  describe('example #1', () => {
    const SimpleUserValidationFields = {
      name: {
        validate(value, field, propertyName) {
          // Just validate that the value is not "falsy"
          if (!value) {
            throw new TypeError(`Cannot set ${propertyName} to: ${value}`);
          }
        }
      }
    };

    class SimpleUser extends Validator(SimpleUserValidationFields) {
      constructor(obj) {
        super();

        this.name = obj.name;

        return super.initializeValidation();
      }
    }

    it('validates simple user', () => {
      const user = new SimpleUser({ name: 'a name' }).validate();

      expect(user.name).to.equal('a name');
      expect(() => {
        user.name = '';
      }).to.throw(TypeError, /Cannot set name to: /);
    });
  });

  describe('example #2', () => {
    it('validates fields with custom validator', () => {
      const user = new User();

      expect(() => {
        user.firstName = '1';
      }).to.throw(RangeError, /firstName should be between 3 and 10/);

      expect(() => {
        user.firstName = 1;
      }).to.throw(TypeError);

      expect(() => {
        user.email = 's@@@@error';
      }).to.throw(TypeError, 'Expected email to be a email address');

      expect(() => {
        user.unknown = [];
      }).to.throw(Error, /Missing field: unknown/);
    });
  });

  describe('example #3', () => {

    it('can use validators for objects', () => {
      const EmailValidator = Validator({
        primaryEmail: UserValidationFields.email,
        secondaryEmail: UserValidationFields.email
      });

      const emailSettings = EmailValidator.from({
        primaryEmail: 'first@example.com',
        secondaryEmail: 'second@example.com'
      });

      emailSettings.validate(); // OK

      const otherEmailSettings = EmailValidator.from();

      expect(() => {
        otherEmailSettings.primaryEmail = 'NOT_AN_EMAIL';
      }).to.throw(TypeError, 'Expected primaryEmail to be a email address');
    });
  });
});
