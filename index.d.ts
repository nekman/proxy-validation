namespace Validator {
  export interface Field {
    min?: number;
    max?: number;
    required?: boolean;
    validate(value: any, field: Field, name: string | PropertyKey): void;
  }
}