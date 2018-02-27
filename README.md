# Proxy-validation

A very basic and simple validation utility (almost more of a pattern than as a library) that can be used as a helper when validating JS-objects.
No smart built-in validators because - different business rules often requires custom/special validators.

You'll need to implement your own `validate` methods!

## Code examples

### Simple example #1:

```javascript
const Validator = require('proxy-validation');

const UserValidationFields = {
  name: {
    validate(value, field, propertyName) {
      // Just validate that the value is not "falsy"
      if (!value) {
        throw new TypeError(`Cannot set ${propertyName} to: ${value}`);
      }
    }
  }
};

class User extends Validator(UserValidationFields) {
  constructor(obj) {
    super();

    this.name = obj.name;

    return super.initializeValidation();
  }
}

const user = new User({ name: 'a name' });

user.validate(); // OK

user.name = '';
// Throws TypeError: Cannot set name to ''
```

### Simple example #2:

```javascript
const Validator = require('proxy-validation');
const { StringValidator } = require('proxy-validation/lib/validators');

const UserValidationFields = {
  firstName: {
    min: 3,
    max: 10,
    validate: StringValidator.validateField
  },
  email: {
    regexp: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
    min: 5,
    max: 200,
    // Custom (naive) validation method.
    validate(value, field, propertyName) {
      StringValidator.validateField(value, field, propertyName);
      if (!field.regexp.test(value)) {
        throw new TypeError(`Expected ${propertyName} to be a email address`);
      }
    }
  }
};

class User extends Validator(UserValidationFields) {
  constructor() {
    super();
    return super.initializeValidation();
  }
}

const user = new User();
user.firstName = '1' // Throws RangeError (string should be between 3 and 10 characters)
user.firstName = 1 // Throws TypeError (not a string)
user.email = 's@@@@error'; // Throws TypeError (expected email to be a email address)
user.unknown = [] // Throws Error (Unknown field)
```

### Simple example #3 - Without using class

Given that we have the `UserValidationFields` and required dependencies from  "Simple example #2":
```javascript
const EmailValidator = Validator({
  primaryEmail: UserValidationFields.email,
  secondaryEmail: UserValidationFields.email
});


const emailSettings = EmailValidator.from({
  primaryEmail: 'first@example.com',
  secondaryEmail: 'second@example.com'
});

emailSettings.validate(); // OK

const otherEmailSettings = EmailValidator.from();
otherEmailSettings.primaryEmail = 'NOT_AN_EMAIL';
```

For more examples, see <a href="https://github.com/nekman/proxy-validation/tree/master/test">/test</a>.

### Requirements
Node 6+

### Developing
```bash
# install dependencies
npm i
# run tests
npm test
# lint
npm run eslint
# check coverage
npm run coverage
```