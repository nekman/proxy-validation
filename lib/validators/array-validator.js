module.exports = class ArrayValidator {
  static validate(input, propName = '') {
    if (!Array.isArray(input)) {
      throw new TypeError(`Expected ${propName} to be an array`);
    }
  }

  /**
   *
   * @param {any} input
   * @param {Validation.Field} field
   * @param {string} propertyName
   */
  static validateField(input, field, propertyName) {
    ArrayValidator.validate(input, propertyName);
  }
};

