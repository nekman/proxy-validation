module.exports = class NumberValidator {
  static validate(input, propName = '') {
    if (typeof input !== 'number') {
      throw new TypeError(`Expected ${propName} to be a number`);
    }
  }

  /**
   *
   * @param {any} input
   * @param {Validation.Field} field
   * @param {string} propertyName
   */
  static validateField(input, field, propertyName) {
    NumberValidator.validate(input, propertyName);
  }
};

