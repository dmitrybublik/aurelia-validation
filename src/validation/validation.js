import {ObserverLocator} from 'aurelia-binding'
import {ValidationLocaleDefaults} from '../resources/defaults';

export class ValidationLocaleRepository{
    constructor() {
        this.defaults = new ValidationLocaleDefaults();
        this.currentLocale = null;
        this.currentLocaleIdentifier = null;
    }

    reset(){
        this.currentLocaleIdentifier = null;
        this.currentLocale = null;
    }

    load(lang){
        var self = this;
        return new Promise( ( resolve, reject) => {
            if (self.currentLocaleIdentifier === lang && self.currentLocale !== null) {
                resolve(true);
                return;
            }
            self.currentLocaleIdentifier = lang;
            System.import('./src/resources/' + self.currentLocaleIdentifier).then(function (resource) {
                self.currentLocale = resource.data;
                resolve(true);
            });
        });
    }

    getValueFor(identifier, category)
    {
        if(this.currentLocale && this.currentLocale[category])
        {
            var currentLocaleSetting = this.currentLocale[category][identifier];
            if(currentLocaleSetting !== undefined && currentLocaleSetting !== null)
                return currentLocaleSetting;
        }
        if(this.defaults[category])
        {
            var defaultSetting = this.defaults[category][identifier];
            if(defaultSetting !== undefined && defaultSetting !== null)
                return defaultSetting;
        }
        throw 'Could not find validation : ' + identifier + ' in category: ' + category;
    }


    setting(settingIdentifier){
        return this.getValueFor(settingIdentifier, 'settings');
    }

    translate(translationIdentifier, newValue, threshold) {
        var translation = this.getValueFor(translationIdentifier, 'messages');
        if (typeof translation === 'function') {
            return translation(newValue, threshold);
        }
        if(typeof translation === 'string') {
            return translation;
        }
        throw 'Validation message for ' + translationIdentifier + 'was in an unsupported format';
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
        this.passesRule(new MinimumValueValidationRule(minimumValue));
        return this;
    }
    between(minimumValue, maximumValue)
    {
        this.passesRule(new BetweenValueValidationRule(minimumValue, maximumValue));
        return this;
    }


    maximum(maximumValue) {
        this.passesRule(new MaximumValueValidationRule(maximumValue));
        return this;
    }

    equals(otherValue, otherValueLabel) {
        this.passesRule(new EqualityValidationRule(otherValue, true, otherValueLabel));
        return this;
    }

    notEquals(otherValue, otherValueLabel) {
        this.passesRule(new EqualityValidationRule(otherValue, false, otherValueLabel));
        return this;
    }

    email() {
        this.passesRule(new EmailValidationRule());
        return this;
    }

    minLength(minimumValue) {
        this.passesRule(new MinimumLengthValidationRule(minimumValue));
        return this;
    }

    maxLength(maximumValue) {
        this.passesRule(new MaximumLengthValidationRule(maximumValue));
        return this;
    }

    betweenLength(minimumValue, maximumValue)
    {
        this.passesRule(new BetweenLengthValidationRule(minimumValue, maximumValue));
        return this;
    }

    isNumeric() {
        this.passesRule(new NumericValidationRule());
        return this;
    }

    isDigit(){
        this.passesRule(new DigitValidationRule());
        return this;
    }

    isAlphanumeric(){
        this.passesRule(new AlphaNumericValidationRule());
        return this;
    }

    isAlphanumericOrWhitespace(){
        this.passesRule(new AlphaNumericOrWhitespaceValidationRule());
        return this;
    }

    isStrongPassword(minimumComplexityLevel){
        this.passesRule(new StrongPasswordValidationRule(minimumComplexityLevel));
        return this;
    }

    matchesRegex(regexString) {
        this.matches(new RegExp(regexString));
        return this;
    }

    matches(regex) {
        this.passesRule(new RegexValidationRule(regex));
        return this;
    }

    passes(customFunction, threshold)
    {
        this.passesRule(new CustomFunctionValidationRule(customFunction, threshold));
        return this;
    }

    passesRule(validationRule) {
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
            shouldBeMessage = Validation.Locale.translate('isRequired');
        }
        else {
            //validate rules
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
    constructor(threshold, onValidate, message) {
        this.onValidate = onValidate;
        this.threshold = threshold;
        this.message = message;
        this.errorMessage = null;
        this.ruleName = this.constructor.name;
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
            if(this.message)
            {
                if ( typeof(this.message) === 'function')
                {
                    this.errorMessage = this.message(currentValue, this.threshold);
                }
                else if(typeof(this.message) === 'string')
                {
                    this.errorMessage = this.message;
                }
                else
                    throw 'Unable to handle the error message:' + this.message;
            }
            else
            {
                this.errorMessage = Validation.Locale.translate(this.ruleName, currentValue, this.threshold);
            }
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
                return newValue.length !== undefined
                    && newValue.length >= threshold.minimumLength
                    && newValue.length < threshold.maximumLength;
            }
        );
    }
}

export class CustomFunctionValidationRule extends ValidationRule{
    constructor(customFunction, threshold){
        super(
            threshold,
            customFunction
        )
    }
}

export class NumericValidationRule extends ValidationRule {
    constructor() {
        super(
            null,
            (newValue) => {
                var numericRegex = Validation.Locale.setting('numericRegex');
                var floatValue = parseFloat(newValue);
                return !Number.isNaN(parseFloat(floatValue))
                    && Number.isFinite(floatValue)
                    && numericRegex.test(newValue);
            }
        );
    }
}

export class RegexValidationRule extends ValidationRule {
    constructor(regex) {
        super(
            regex,
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
                if(newValue instanceof Date && threshold.otherValue instanceof Date)
                    return threshold.equality === (newValue.getTime() === threshold.otherValue.getTime());
                return threshold.equality === (newValue === threshold.otherValue);
            }
        );
    }
}
