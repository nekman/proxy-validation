const Role = require('./role');
const {
  StringValidator,
  NumberValidator,
  ArrayValidator
} = require('../../lib/validators');

/** @type  {{ [x: string]: Validation.Field; }} ValidationFields */
module.exports = {
  email: {
    min: 6,
    max: 150,
    validate(value, field, name) {
      StringValidator.validateField(value, field, name);
      if (!value.includes('@')) {
        throw new TypeError(`Expected ${name} to be a email address`);
      }
    }
  },
  firstName: {
    min: 3,
    max: 50,
    validate: StringValidator.validateField
  },
  lastName: {
    min: 3,
    max: 50,
    validate: StringValidator.validateField
  },
  postalCode: {
    validate: NumberValidator.validateField
  },
  created: {
    validate: NumberValidator.validateField,
    required: false
  },
  roles: {
    min: 3,
    max: 10,
    validate(roles, field, name) {
      ArrayValidator.validateField(roles, field, name);
      roles.forEach(role => {
        if (!(role instanceof Role)) {
          throw new TypeError('roles[] can only contain Role');
        }
        role.validate();
      });
    }
  },
  groups: {
    min: 3,
    max: 10,
    validate(groups, field, name) {
      ArrayValidator.validateField(groups, field, name);
      groups.forEach((group, index) =>
        StringValidator.validateField(group, field, `${name}[${index}]`)
      );
    }
  }
};

