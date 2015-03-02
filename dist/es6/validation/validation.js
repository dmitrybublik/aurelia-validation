import {ObserverLocator} from 'aurelia-binding'


export class ValidationLocaleRepository{
    constructor(lang = "en-US") {
        load(lang);
    }

    loadResource() {
        var self = this;
        return new Promise( ( resolve, reject) => {
            if (self.data !== null) {
                resolve(true);
                return;
            }

             System.import('./src/resources/' + self.activeLanguage).then(function (resource) {
                 self.data = resource.data;
                 resolve(true);
             });
        });
    }

    reset(){
        load('en-US');
    }

    load(lang){
        this.activeLanguage = lang;
        this.data = null;
        this.loadResource();
    }

    tr(what) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.loadResource().then((response) => {
                resolve(self.data[what]);
            });
        });
    }
}

export class Validation {
    static inject() {
        return [ObserverLocator];
    }

    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }

    on(subject) {
        return new ValidationGroup(subject, this.observerLocator);
    }
}

Validation.Utilities = {
    isEmptyValue(val) {
        if (typeof val === 'function') {
            return this.isEmptyValue(val());
        }
        if (val === undefined) {
            return true;
        }
        if (val === null) {
            return true;
        }
        if (val === "") {
            return true;
        }
        if (typeof (val) === 'string') {
            if (String.prototype.trim) {
                val = val.trim();
            }
            else {
                val = val.replace(/^\s+|\s+$/g, '');
            }
        }

        if (val.length !== undefined) {
            return 0 === val.length;
        }
        return false;
    }
};
Validation.Locale = new ValidationLocaleRepository();


export class ValidationGroup {
    constructor(subject, observerLocator) {
        this.observerLocator = observerLocator;
        this.isValid = true;
        this.subject = subject;
        this.validationProperties = [];
    }

    checkValidity() {
        for (var i = this.validationProperties.length - 1; i >= 0; i--) {
            var validatorProperty = this.validationProperties[i];
            if (!validatorProperty.isValid) {
                this.isValid = false;
                return;
            }
        }
        this.isValid = true;
    }

    checkAll() {
        for (var i = this.validationProperties.length - 1; i >= 0; i--) {
            var validatorProperty = this.validationProperties[i];
            validatorProperty.validateCurrentValue(true);
        }
        return this.isValid;
    }

    ensure(propertyName) {
        this.validationProperties.push(new ValidationProperty(this.observerLocator, propertyName, this));
        return this;
    }

    notEmpty() {
        this.validationProperties[this.validationProperties.length - 1].notEmpty();
        return this;
    }

    minimum(minimumValue) {
        this.passes(new MinimumValueValidationRule(minimumValue));
        return this;
    }
    between(minimumValue, maximumValue)
    {
        this.passes(new BetweenValueValidationRule(minimumValue, maximumValue));
        return this;
    }


    maximum(maximumValue) {
        this.passes(new MaximumValueValidationRule(maximumValue));
        return this;
    }

    equals(otherValue, otherValueLabel) {
        this.passes(new EqualityValidationRule(otherValue, true, otherValueLabel));
        return this;
    }

    notEquals(otherValue, otherValueLabel) {
        this.passes(new EqualityValidationRule(otherValue, false, otherValueLabel));
        return this;
    }

    email() {
        this.passes(new EmailValidationRule());
        return this;
    }



    minLength(minimumValue) {
        this.passes(new MinimumLengthValidationRule(minimumValue));
        return this;
    }

    maxLength(maximumValue) {
        this.passes(new MaximumLengthValidationRule(maximumValue));
        return this;
    }

    betweenLength(minimumValue, maximumValue)
    {
        this.passes(new BetweenLengthValidationRule(minimumValue, maximumValue));
        return this;
    }

    isNumeric() {
        this.passes(new NumericValidationRule());
        return this;
    }

    isDigit(){
        this.passes(new DigitValidationRule());
        return this;
    }

    isAlphanumeric(){
        this.passes(new AlphaNumericValidationRule());
        return this;
    }

    isAlphanumericOrWhitespace(){
        this.passes(new AlphaNumericOrWhitespaceValidationRule());
        return this;
    }

    isStrongPassword(minimumComplexityLevel){
        this.passes(new StrongPasswordValidationRule(minimumComplexityLevel));
        return this;
    }

    matchesRegex(regexString) {
        this.matches(new RegExp(regexString));
        return this;
    }

    matches(regex) {
        this.passes(new RegexValidationRule(regex));
        return this;
    }

    passes(validationRule) {
        var validationProperty = this.validationProperties[this.validationProperties.length - 1];
        validationProperty.addValidationRule(validationRule);
        return this;
    }
}
export class ValidationProperty {
    constructor(observerLocator, propertyName, validationGroup) {
        this.propertyName = propertyName;
        this.validationGroup = validationGroup;
        this.isValid = true;
        this.isRequired = false;
        this.message = '';
        this.validationRules = [];
        this.onValidateCallbacks = [];
        this.observer = observerLocator
            .getObserver(validationGroup.subject, propertyName);

        this.observer.subscribe((newValue, oldValue) => {
            this.validate(newValue, true);
        });
        this.isDirty = false;
    }

    onValidate(onValidateCallback) {
        this.onValidateCallbacks.push(onValidateCallback);
    }

    addValidationRule(validationRule) {
        if (validationRule.validate === undefined) //Can ES6 check on base class??
            throw new exception("That's not a valid validationRule");
        this.validationRules.push(validationRule);
        this.validateCurrentValue(false);
    }

    validateCurrentValue(forceDirty) {
        this.validate(this.observer.getValue(), forceDirty);
    }

    validate(newValue, shouldBeDirty) {
        var shouldBeValid = true;
        var shouldBeMessage = '';
        if (Validation.Utilities.isEmptyValue(newValue)) {
            shouldBeValid = !this.isRequired;
            shouldBeMessage = Validation.Locale.tr('isRequired');
        }
        else {
            //validate strategies
            for (var i = 0; i < this.validationRules.length; i++) {
                var rule = this.validationRules[i];
                if (!rule.validate(newValue)) {
                    shouldBeValid = false;
                    shouldBeMessage = rule.explain();
                    break;
                }
            }
        }

        var notifyObservers = (!this.isDirty && shouldBeDirty) || (this.isValid !== shouldBeValid) || (this.message !== shouldBeMessage);


        this.message = shouldBeMessage;
        this.isValid = shouldBeValid;
        if (shouldBeDirty)
            this.isDirty = true;

        if (notifyObservers) {
            for (var i = 0; i < this.onValidateCallbacks.length; i++) {
                var callback = this.onValidateCallbacks[i];
                callback(this);
            }
        }
        this.validationGroup.checkValidity();
    }


    notEmpty() {
        this.isRequired = true;
        this.validateCurrentValue();
    }
}

export class ValidationRule {

    constructor(threshold, message, onValidate) {
        this.onValidate = onValidate;
        this.threshold = threshold;
        this.message = message;
        this.errorMessage = null;
    }

    withMessage(message) {
        this.message = message;
    }

    explain() {
        return this.errorMessage;
    }

    validate(currentValue) {

        if (typeof (currentValue) === 'string') {
            if (String.prototype.trim) {
                currentValue = currentValue.trim();
            }
            else {
                currentValue = currentValue.replace(/^\s+|\s+$/g, '');
            }
        }
        var result = this.onValidate(currentValue, this.threshold);
        if (result) {
            this.errorMessage = null;
        }
        else {
            this.errorMessage = this.message(currentValue, this.threshold);
        }
        return result;
    }
}

export class EmailValidationRule extends ValidationRule {
    constructor() {
        this.emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        super(
            null,
            (newValue, threshold) => {
                return `not a valid email address`;
            },
            (newValue, threshold) => {
                return this.emailRegex.test(newValue);
            }
        );
    }
}

export class MinimumLengthValidationRule extends ValidationRule {
    constructor(minimumLength) {
        super(
            minimumLength,
            (newValue, minimumLength) => {
                return `needs to be at least ${minimumLength} characters long`;
            },
            (newValue, minimumLength) => {
                return newValue.length !== undefined && newValue.length >= minimumLength;
            }
        );
    }
}

export class MaximumLengthValidationRule extends ValidationRule {
    constructor(maximumLength) {
        super(
            maximumLength,
            (newValue, maximumLength) => {
                return `cannot be longer then ${maximumLength} characters`;
            },
            (newValue, maximumLength) => {
                return newValue.length !== undefined && newValue.length < maximumLength;
            }
        );
    }
}

export class BetweenLengthValidationRule extends ValidationRule {
    constructor(minimumLength, maximumLength) {
        super(
            { minimumLength : minimumLength, maximumLength : maximumLength },
            (newValue, threshold) => {
                return `needs to be at between ${threshold.minimumLength} and ${threshold.maximumLength} characters long`;
            },
            (newValue, threshold) => {
                return newValue.length !== undefined
                    && newValue.length >= threshold.minimumLength
                    && newValue.length < threshold.maximumLength;
            }
        );
    }
}

export class NumericValidationRule extends ValidationRule {
    constructor() {
        this.numericRegex = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;

        super(
            null,
            (newValue) => {
                return `must be a number`;
            },
            (newValue) => {
                var floatValue = parseFloat(newValue);
                return !Number.isNaN(parseFloat(floatValue))
                    && Number.isFinite(floatValue)
                    && this.numericRegex.test(newValue);
            }
        );
    }
}

export class RegexValidationRule extends ValidationRule {
    constructor(regex) {
        super(
            regex,
            (newValue, regex) => {
                return `not a valid value`;
            },
            (newValue, regex) => {
                return regex.test(newValue);
            }
        );
    }
}

export class MinimumValueValidationRule extends ValidationRule {
    constructor(minimumValue) {
        super(
            minimumValue,
            (newValue, minimumValue) => {
                return `needs to be ${minimumValue} or more`;
            },
            (newValue, minimumValue) => {
                return minimumValue <= newValue;
            }
        );
    }
}
export class MaximumValueValidationRule extends ValidationRule {
    constructor(maximumValue) {
        super(
            maximumValue,
            (newValue, maximumValue) => {
                return `needs to be less than ${maximumValue}`;
            },
            (newValue, maximumValue) => {
                return newValue < maximumValue;
            }
        );
    }
}

export class BetweenValueValidationRule extends ValidationRule {
    constructor(minimumValue, maximumValue) {
        super(
            { minimumValue : minimumValue, maximumValue : maximumValue},
            (newValue, threshold) => {
                return `needs to be between ${threshold.minimumValue} and ${threshold.maximumValue}`;
            },
            (newValue, threshold) => {
                return threshold.minimumValue <= newValue && newValue < threshold.maximumValue;
            }
        );
    }
}

export class DigitValidationRule extends ValidationRule {
    constructor() {
        this.digitRegex = /^\d+$/;
        super(
            null,
            (newValue, threshold) => {
                return `can contain only digits`;
            },
            (newValue, threshold) => {
                return this.digitRegex.test(newValue);
            }
        );
    }
}

export class AlphaNumericValidationRule extends ValidationRule
{
    constructor() {
        this.alphaNumericRegex = /^[a-z0-9]+$/i;
        super(
            null,
            (newValue, threshold) => {
                return `can contain only alphanumerical characters`;
            },
            (newValue, threshold) => {
                return this.alphaNumericRegex.test(newValue);
            }
        );
    }
}


export class AlphaNumericOrWhitespaceValidationRule extends ValidationRule
{
    constructor() {
        this.alphaNumericRegex = /^[a-z0-9\s]+$/i;
        super(
            null,
            (newValue, threshold) => {
                return `can contain only alphanumerical characters or spaces`;
            },
            (newValue, threshold) => {
                return this.alphaNumericRegex.test(newValue);
            }
        );
    }
}


export class StrongPasswordValidationRule extends ValidationRule
{
    constructor(minimumComplexityLevel) {
        var complexityLevel = 4;
        if(minimumComplexityLevel && minimumComplexityLevel > 1 && minimumComplexityLevel < 4)
            complexityLevel = minimumComplexityLevel;


        super(
            complexityLevel,
            (newValue, threshold) => {
                if(threshold == 4)
                    return `should contain a combination of lowercase letters, uppercase letters, digits and special characters`;
                else
                    return `should contain at least ${threshold} of the following groups: lowercase letters, uppercase letters, digits and special characters`;
            },
            (newValue, threshold) => {
                if (typeof (newValue) !== 'string')
                    return false;
                var strength = 0;

                strength += /[A-Z]+/.test(newValue) ? 1 : 0;
                strength += /[a-z]+/.test(newValue) ? 1 : 0;
                strength += /[0-9]+/.test(newValue) ? 1 : 0;
                strength += /[\W]+/.test(newValue) ? 1 : 0;
                return strength >= threshold;
            }
        );
    }
}

export class EqualityValidationRule extends ValidationRule {
    constructor(otherValue, equality, otherValueLabel) {
        super(
            {
                otherValue: otherValue,
                equality: equality,
                otherValueLabel: otherValueLabel
            },
            (newValue, threshold) => {
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
            (newValue, threshold) => {
                if(newValue instanceof Date && threshold.otherValue instanceof Date)
                    return threshold.equality === (newValue.getTime() === threshold.otherValue.getTime());
                return threshold.equality === (newValue === threshold.otherValue);
            }
        );
    }
}
