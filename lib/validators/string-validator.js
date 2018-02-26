const StringUtils = require('../utils/string-utils');

module.exports = class StringValidator {
  /**
   * @param {any} input
   */
  static validateNonEmptyString(input, propertyName = '') {
    if (StringUtils.isEmpty(input)) {
      throw new TypeError(`"${propertyName}" must be a non empty string`);
    }
  }

  /**
   * @param {any} input
   */
  static validateLength(input, min = 0, max = 255, propertyName = '') {
    this.validateNonEmptyString(input, propertyName);
    const { length } = input;

    if (length < min || length > max) {
      throw new RangeError(
        `${propertyName} should be between ${min} and ${max}`
      );
    }
  }

  static validate(input, min, max, propertyName = '') {
    this.validateLength(input, min, max, propertyName);
  }

  /**
   *
   * @param {any} input
   * @param {Validator.Field} field
   * @param {string} propertyName
   */
  static validateField(input, field, propertyName) {
    StringValidator.validate(input, field.min, field.max, propertyName);
  }
};

