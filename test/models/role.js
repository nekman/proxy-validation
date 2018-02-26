const Validator = require('../../index');
const { StringValidator } = require('../../lib/validators');

const ValidationFields = {
  name: {
    min: 3,
    max: 50,
    validate: StringValidator.validateField
  }
};

class Role extends Validator(ValidationFields) {
  constructor(obj = {}) {
    super();
    /** @type {string} */
    this.name = obj.name;

    this.extra = obj.extra;

    return super.initializeValidation();
  }
}

module.exports = Role;
