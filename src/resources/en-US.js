//en-US is loaded by default.
//to the rest of the world: I'm so very sorry.
export let data = {
    settings : {
        'numericRegex' : /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
    },
    messages : {
        'isRequired' : 'is required',
        'AlphaNumericOrWhitespaceValidationRule' : (newValue, threshold) => {
            return `can contain only alphanumerical characters or spaces`;
        },
        'AlphaNumericValidationRule' : (newValue, threshold) => {
            return `can contain only alphanumerical characters`;
        },
        'BetweenLengthValidationRule' : (newValue, threshold) => {
            return `needs to be at between ${threshold.minimumLength} and ${threshold.maximumLength} characters long`;
        },
        'BetweenValueValidationRule' : (newValue, threshold) => {
            return `needs to be between ${threshold.minimumValue} and ${threshold.maximumValue}`;
        },
        'CustomFunctionValidationRule' : (newValue, threshold) => {
            return `not a valid value`
        },
        'DigitValidationRule' :  (newValue, threshold) => {
            return `can contain only digits`;
        },
        'EmailValidationRule' : (newValue, threshold) => {
            return `is not a valid email address`;
        },
        'EqualityValidationRule' : (newValue, threshold) => {
            if (threshold.otherValueLabel)
                if (threshold.equality)
                    return `does not match ${threshold.otherValueLabel}`;
                else
                    return `cannot not match ${threshold.otherValueLabel}`;
            else if (threshold.equality)
                return `should be ${threshold.otherValue}`;
            else
                return `cannot not be ${threshold.otherValue}`;
        },
        'MinimumLengthValidationRule' : (newValue, threshold) => {
            return `needs to be at least ${threshold} characters long`;
        },
        'MinimumValueValidationRule' : (newValue, threshold) => {
            return `needs to be ${threshold} or more`;
        },
        'MaximumLengthValidationRule' : (newValue, threshold) => {
            return `cannot be longer then ${threshold} characters`;
        },
        'MaximumValueValidationRule' : (newValue, threshold) => {
            return `needs to be less than ${threshold}`;
        },
        'NumericValidationRule' : (newValue, threshold) => {
            return `needs to be a number`;
        },
        'RegexValidationRule' : (newValue, threshold) => {
            return `not a valid value`;
        },
        'StrongPasswordValidationRule' : (newValue, threshold) => {
            if(threshold == 4)
                return `should contain a combination of lowercase letters, uppercase letters, digits and special characters`;
            else
                return `should contain at least ${threshold} of the following groups: lowercase letters, uppercase letters, digits or special characters`;
        }
    }
}