const ProxyValidator = require('../../index');
const UserValidationFields = require('./user-validation-fields');

module.exports = class User extends ProxyValidator {
  constructor(obj = {}) {
    super(UserValidationFields);

    /** @type {string} */
    this.email = obj.email;
    /** @type {string} */
    this.firstName = obj.firstName;
    /** @type {string} */
    this.lastName = obj.lastName;
    /** @type {Number} */
    this.postalCode = obj.postalCode;
    /** @type {Number} */
    this.created = obj.created;
    /** @type {Array<Role>} */
    this.roles = obj.roles;
    /** @type {Array<string>} */
    this.groups = obj.groups;

    return super.initializeValidation();
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
};
