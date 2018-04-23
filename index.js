const defaultValidationOptions = {
  ignoreUndefinedProperties: false,
  allowExtraProperties: false
};

module.exports = class ProxyValidation {

  /**
   *
   * @param {Validation.ValidationFields} validationFields
   * @param {boolean?} initializeValidation default false
   */
  constructor(validationFields = {}, initializeValidation = false) {
    Object.defineProperty(this, 'validationFields', {
      enumerable: false,
      get() { return validationFields; }
    });

    if (initializeValidation) {
      return this.initializeValidation();
    }
  }

  /**
   * Validates a instance properties by test them on the matching `ValidationFields`.
   *
   * @param {Validation.ValidationOptions?} options
   * @return {this}
   */
  validate(options = defaultValidationOptions) {
    const {
      allowExtraProperties = defaultValidationOptions.allowExtraProperties,
      ignoreUndefinedProperties = defaultValidationOptions.ignoreUndefinedProperties
    } = options;

    // All validation properties that applies to the instance
    const validationKeys = Object.keys(this.validationFields);
    // All instance properties
    const instanceKeys = Object.keys(this).filter(key => key !== 'validationFields');

    // If `allowExtraProperties` is false, verify that we don't have
    // same amount of properties on the instance and the validationKeys.
    if (!allowExtraProperties && instanceKeys.length > validationKeys.length) {
      throw new TypeError(`Only fields: ${validationKeys.join(',')} is allowed`);
    }

    const hasAllAttributes = validationKeys
      .filter(key => {
        // If `ignoreUndefinedProperties` is true, and the value is `undefined`, ignore
        // the key.
        if (ignoreUndefinedProperties && this[key] === undefined) {
          return false;
        }

        return true;
      })
      .every(key => {
        if (!(key in this.validationFields)) {
          return allowExtraProperties;
        }

        const value = this[key];
        const validationField = this.validationFields[key];

        if (validationField.required === false) {
          // Ignore non required fields
          return true;
        }

        // If a validate function is defined on the validation field,
        // assume we can call it.
        if (typeof validationField.validate === 'function') {
          validationField.validate(value, validationField, key);
        }

        return true;
      });

    // If `allowExtraProperties` is false, verify that we don't have
    // same amount of properties on the instance and the validationKeys.
    if (!allowExtraProperties && !hasAllAttributes) {
      throw new TypeError(`Only fields: ${validationKeys.join(',')} is allowed`);
    }

    return this;
  }

  /**
   * Wraps instance in a `Proxy` that intercepts all "set" and assigns on
   * the objects properties.
   *
   * @return {this}
   */
  initializeValidation() {
    return new Proxy(this, {
      set(target, key, value) {
        const field = target.validationFields[key];
        if (!field) {
          throw new Error(`Missing field: ${key}`);
        }

        if (typeof field.validate === 'function') {
          field.validate(value, field, key);
        }

        // Ok to assign the value to the key.
        target[key] = value;
        return true;
      }
    });
  }

  /**
   * Create a instance by set properties from a plain object.
   *
   * @param {object} obj
   * @param {Validation.ValidationFields?} validationFields
   * @param {boolean?} initializeValidation default false
   * @return {Validation.ProxyValidation}
   */
  static from(obj = {}, validationFields = {}, initializeValidation = false) {
    const validator = new ProxyValidation(validationFields, initializeValidation);
    Object.keys(obj).forEach(key => {
      // Validate so we don't overwrite existing validation methods...
      if (key in validator) {
        throw new TypeError(`Property "${key}" is a reserved property.`);
      }

      validator[key] = obj[key];
    });

    return validator;
  }
};

