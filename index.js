/**
 *
 * @param  {{ [x: string]: Validator.Field; }} ValidationFields
 */
module.exports = ValidationFields => {

  return class ProxyValidator {

    /**
     * Validates a instance properties by test them on the matching `ValidationFields`.
     *
     * @param {boolean?} ignoreUndefinedProperties
     *  if true, `undefined` properties is ignored and will not be validated.
     * @param {boolean?} allowExtraProperties
     *  if true, properties that don't exists in the `ValidationFields` is allowed.
     * @return {this}
     */
    validate(ignoreUndefinedProperties = false, allowExtraProperties = false) {
      // All validation properties that applies to the instance
      const validationKeys = Object.keys(ValidationFields);
      // All instance properties
      const instanceKeys = Object.keys(this);

      // If `allowExtraProperties` is false, verify that we don't have
      // same amount of properties on the instance and the validationKeys.
      if (!allowExtraProperties && instanceKeys.length > validationKeys.length) {
        throw new TypeError(`Only fields: ${validationKeys.join(',')} is allowed`);
      }

      const hasAllAttributes = instanceKeys
        .filter(key => {
          // If `ignoreUndefinedProperties` is true, and the value is `undefined`, ignore
          // the key.
          if (ignoreUndefinedProperties && this[key] === undefined) {
            return false;
          }

          return true;
        })
        .every(key => {
          if (!(key in ValidationFields)) {
            return false;
          }

          const value = this[key];
          const validationField = ValidationFields[key];

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
          const field = ValidationFields[key];
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
     * @param {Object} obj
     * @return {ProxyValidator}
     */
    static from(obj = {}) {
      const validator = new ProxyValidator();
      Object.keys(obj).forEach(key => {
        // Validate so we don't overwrite existing validation methods...
        if (key in validator) {
          throw new TypeError(`Property "${key}" is a reserved property in the validator.`);
        }

        validator[key] = obj[key];
      });

      return validator.initializeValidation();
    }
  };
};
