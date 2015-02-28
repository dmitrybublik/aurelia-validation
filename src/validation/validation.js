import {ObserverLocator} from 'aurelia-binding'
import {Behavior} from 'aurelia-templating';

export class ValidateAttachedBehavior {
    static metadata() {
        return Behavior
            .attachedBehavior('validate');
    }

    static inject() {
        return [Element, ObserverLocator];
    }

    constructor(element, observerLocator) {
        this.element = element;
        this.observerLocator = observerLocator;
        this.changedObservers = [];
    }

    attached() {
        this.subscribeChangedHandlers(this.element);
    }

    searchFormGroup(currentElement, currentDepth) {
        if (currentDepth === 5) {
            return null;
        }
        if (currentElement.classList.contains('form-group')) {
            return currentElement;
        }
        return this.searchFormGroup(currentElement.parentNode, 1 + currentDepth);
    }

    subscribeChangedHandlers(currentElement) {
        var atts = currentElement.attributes;
        if (atts['value.bind']) {
            var bindingValue = atts['value.bind'].value;
            for (var i = 0; i < this.value.validationProperties.length; i++) {
                var validationProperty = this.value.validationProperties[i];
                if (validationProperty.propertyName === bindingValue) {
                    validationProperty.onValidate(
                        (validationProperty) => {
                            var formGroup = this.searchFormGroup(currentElement, 0);
                            if (formGroup) {
                                if (validationProperty.isValid) {
                                    formGroup.classList.remove('has-warning');
                                    formGroup.classList.add('has-success');

                                }
                                else {
                                    formGroup.classList.remove('has-success');
                                    formGroup.classList.add('has-warning');
                                }

                                var labels = currentElement.labels;
                                for (var ii = 0; ii < labels.length; ii++) {
                                    var label = labels[i];
                                    var helpBlock = label.nextSibling;
                                    if (helpBlock) {
                                        if (!helpBlock.classList) {
                                            helpBlock = null;
                                        }
                                        else if (!helpBlock.classList.contains('aurelia-validation-message')) {
                                            helpBlock = null;
                                        }
                                    }

                                    if (!helpBlock) {
                                        helpBlock = document.createElement("p");
                                        helpBlock.classList.add('help-block');
                                        helpBlock.classList.add('aurelia-validation-message');

                                        if (label.nextSibling) {
                                            label.parentNode.insertBefore(helpBlock, label.nextSibling);
                                        }
                                        else {
                                            label.parentNode.appendChild(helpBlock);
                                        }
                                    }

                                    helpBlock.textContent = validationProperty.message;
                                }

                            }
                        });
                }
            }
        }
        var children = currentElement.children;
        for (var i = 0; i < children.length; i++) {
            this.subscribeChangedHandlers(children[i]);
        }
    }

    detached() {
        for (var i = 0; i < this.changedObservers.length; i++) {
            this.changedObservers[i]();
        }
        this.changedObservers = [];
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
        return new ValidationGroup(subject, this.observerLocator, this);
    }

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
}

export class ValidationGroup {
    constructor(subject, observerLocator, validationUtilities) {
        this.observerLocator = observerLocator;
        this.isValid = true;
        this.subject = subject;
        this.validationProperties = [];
        this.validationUtilities = validationUtilities;
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
        this.validationProperties.push(new ValidationProperty(this.observerLocator, propertyName, this, this.validationUtilities));
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
        this.passes(new EqualityRule(otherValue, true, otherValueLabel));
        return this;
    }

    notEquals(otherValue, otherValueLabel) {
        this.passes(new EqualityRule(otherValue, false, otherValueLabel));
        return this;
    }

    email() {
        this.passes(new RegexValidationRule(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/));
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
        this.matches(/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/);
        this.passes(new NumericValidationRule());
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
    constructor(observerLocator, propertyName, validationGroup, validationUtilities) {
        this.validationUtilities = validationUtilities;
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
        if (this.validationUtilities.isEmptyValue(newValue)) {
            shouldBeValid = !this.isRequired;
            shouldBeMessage = 'is required';
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
        super(
            null,
            (newValue) => {
                return `must be a number`;
            },
            (newValue) => {
                var floatValue = parseFloat(newValue);

                var numeric = !Number.isNaN(parseFloat(newValue));
                var finite = Number.isFinite(newValue);
                return !Number.isNaN(parseFloat(floatValue)) && Number.isFinite(floatValue);
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

export class EqualityRule extends ValidationRule {
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
                return threshold.equality === (newValue === threshold.otherValue);
            }
        );
    }
}
