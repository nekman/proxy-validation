declare namespace Validation {

  export class ProxyValidation<T extends object> {

    /**
     *
     * @param validationFields The validation fields to use
     * @param initializeValidation default `false`
     */
    constructor(validationFields: ValidationFields, initializeValidation = false): T & ProxyValidation<T>;

    /**
     * Validates a instance properties by test them on the matching `ValidationFields`.
     *
     * @param ignoreUndefinedProperties
     *  if true, `undefined` properties is ignored and will not be validated.
     * @param allowExtraProperties
     *  if true, properties that don't exists in the `ValidationFields` is allowed.
     */ 
    validate(ignoreUndefinedProperties = false, allowExtraProperties = false): T & ProxyValidation<T>;

    /**
     * Wraps instance in a `Proxy` that intercepts all "set" and assigns on
     * the objects properties.
     */
    initializeValidation(): T & ProxyValidation<T>;

    /**
     * Create a instance by set properties from a plain object.
     *
     * @param obj the object
     * @param validationFields The validation fields to use
     * @param initializeValidation default `false`
     */
    static from<T>(obj?: T, validationFields: ValidationFields, initializeValidation = false): T & ProxyValidation<T>;
  }

  export interface ValidationOptions {
    /** if true, `undefined` properties is ignored and will not be validated. */
    ignoreUndefinedProperties?: boolean;

    /** if true, properties that don't exists in the `ValidationFields` is allowed. */
    allowExtraProperties?: boolean;
  }

  export interface ValidationFields {
    [x: string]: Field;
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
  export = Validation.ProxyValidation;
}
