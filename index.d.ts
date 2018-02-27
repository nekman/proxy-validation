declare namespace Validator {

  export class ProxyValidator {
    // Due to https://github.com/Microsoft/TypeScript/issues/3841
    'constructor': typeof ProxyValidator;

    /**
     * Validates a instance properties by test them on the matching `ValidationFields`.
     *
     * @param ignoreUndefinedProperties
     *  if true, `undefined` properties is ignored and will not be validated.
     * @param allowExtraProperties
     *  if true, properties that don't exists in the `ValidationFields` is allowed.
     */ 
    validate(ignoreUndefinedProperties = false, allowExtraProperties = false): this;

    /**
     * Wraps instance in a `Proxy` that intercepts all "set" and assigns on
     * the objects properties.
     */
    initializeValidation(): this;

    /**
     * Create a instance by set properties from a plain object.
     * @param obj
     */
    static from(obj = {}): ProxyValidator;
  }

  export interface Field {
    min?: number;
    max?: number;
    required?: boolean;
    /**
     * Validates the field.
     *
     * @param value The value that should be validated
     * @param field The complete field, with validation properties
     * @param name The property name
     */
    validate(value: any, field: Field, name: string | PropertyKey): void;
  }
}

declare module "proxy-validation" {
  export = (validationFields: Object<string, Field>) => Validator.ProxyValidator;
}
