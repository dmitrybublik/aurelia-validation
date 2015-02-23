"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ObserverLocator = require("aurelia-binding").ObserverLocator;
var Behavior = require("aurelia-templating").Behavior;
var ValidateAttachedBehavior = exports.ValidateAttachedBehavior = (function () {
  function ValidateAttachedBehavior(element, observerLocator) {
    _classCallCheck(this, ValidateAttachedBehavior);

    this.element = element;
    this.observerLocator = observerLocator;
    this.changedObservers = [];
  }

  _prototypeProperties(ValidateAttachedBehavior, {
    metadata: {
      value: function metadata() {
        return Behavior.attachedBehavior("validate");
      },
      writable: true,
      configurable: true
    },
    inject: {
      value: function inject() {
        return [Element, ObserverLocator];
      },
      writable: true,
      configurable: true
    }
  }, {
    attached: {
      value: function attached() {
        this.subscribeChangedHandlers(this.element);
      },
      writable: true,
      configurable: true
    },
    searchFormGroup: {
      value: function searchFormGroup(currentElement, currentDepth) {
        if (currentDepth === 5) {
          return null;
        }
        if (currentElement.classList.contains("form-group")) {
          return currentElement;
        }
        return this.searchFormGroup(currentElement.parentNode, 1 + currentDepth);
      },
      writable: true,
      configurable: true
    },
    subscribeChangedHandlers: {
      value: function subscribeChangedHandlers(currentElement) {
        var _this = this;
        var atts = currentElement.attributes;
        if (atts["value.bind"]) {
          var bindingValue = atts["value.bind"].value;
          for (var i = 0; i < this.value.validationProperties.length; i++) {
            var validationProperty = this.value.validationProperties[i];
            if (validationProperty.propertyName === bindingValue) {
              validationProperty.onValidate(function (validationProperty) {
                var formGroup = _this.searchFormGroup(currentElement, 0);
                if (formGroup) {
                  if (validationProperty.isValid) {
                    formGroup.classList.remove("has-warning");
                    formGroup.classList.add("has-success");
                  } else {
                    formGroup.classList.remove("has-success");
                    formGroup.classList.add("has-warning");
                  }

                  var labels = currentElement.labels;
                  for (var ii = 0; ii < labels.length; ii++) {
                    var label = labels[i];
                    var helpBlock = label.nextSibling;
                    if (helpBlock) {
                      if (!helpBlock.classList) {
                        helpBlock = null;
                      } else if (!helpBlock.classList.contains("aurelia-validation-message")) {
                        helpBlock = null;
                      }
                    }

                    if (!helpBlock) {
                      helpBlock = document.createElement("p");
                      helpBlock.classList.add("help-block");
                      helpBlock.classList.add("aurelia-validation-message");

                      if (label.nextSibling) {
                        label.parentNode.insertBefore(helpBlock, label.nextSibling);
                      } else {
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
      },
      writable: true,
      configurable: true
    },
    detached: {
      value: function detached() {
        for (var i = 0; i < this.changedObservers.length; i++) {
          this.changedObservers[i]();
        }
        this.changedObservers = [];
      },
      writable: true,
      configurable: true
    }
  });

  return ValidateAttachedBehavior;
})();
var Validation = exports.Validation = (function () {
  function Validation(observerLocator) {
    _classCallCheck(this, Validation);

    this.observerLocator = observerLocator;
  }

  _prototypeProperties(Validation, {
    inject: {
      value: function inject() {
        return [ObserverLocator];
      },
      writable: true,
      configurable: true
    }
  }, {
    on: {
      value: function on(subject) {
        return new ValidationGroup(subject, this.observerLocator, this);
      },
      writable: true,
      configurable: true
    },
    isEmptyValue: {
      value: function isEmptyValue(val) {
        if (typeof val === "function") {
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
        if (typeof val === "string") {
          if (String.prototype.trim) {
            val = val.trim();
          } else {
            val = val.replace(/^\s+|\s+$/g, "");
          }
        }

        if (val.length !== undefined) {
          return 0 === val.length;
        }
        return false;
      },
      writable: true,
      configurable: true
    }
  });

  return Validation;
})();
var ValidationGroup = exports.ValidationGroup = (function () {
  function ValidationGroup(subject, observerLocator, validationUtilities) {
    _classCallCheck(this, ValidationGroup);

    this.observerLocator = observerLocator;
    this.isValid = true;
    this.subject = subject;
    this.validationProperties = [];
    this.validationUtilities = validationUtilities;
  }

  _prototypeProperties(ValidationGroup, null, {
    checkValidity: {
      value: function checkValidity() {
        for (var i = this.validationProperties.length - 1; i >= 0; i--) {
          var validatorProperty = this.validationProperties[i];
          if (!validatorProperty.isValid) {
            this.isValid = false;
            return;
          }
        }
        ;
        this.isValid = true;
      },
      writable: true,
      configurable: true
    },
    checkAll: {
      value: function checkAll() {
        for (var i = this.validationProperties.length - 1; i >= 0; i--) {
          var validatorProperty = this.validationProperties[i];
          validatorProperty.validateCurrentValue(true);
        }
        ;
        return this.isValid;
      },
      writable: true,
      configurable: true
    },
    ensure: {
      value: function ensure(propertyName) {
        this.validationProperties.push(new ValidationProperty(this.observerLocator, propertyName, this, this.validationUtilities));
        return this;
      },
      writable: true,
      configurable: true
    },
    notEmpty: {
      value: function notEmpty() {
        this.validationProperties[this.validationProperties.length - 1].notEmpty();
        return this;
      },
      writable: true,
      configurable: true
    },
    minimum: {
      value: function minimum(minimumValue) {
        this.passes(new MinimumValueRule(minimumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    maximum: {
      value: function maximum(maximumValue) {
        this.passes(new MaximumValueRule(maximumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    equals: {
      value: function equals(otherValue, otherValueLabel) {
        this.passes(new EqualityRule(otherValue, true, otherValueLabel));
        return this;
      },
      writable: true,
      configurable: true
    },
    notEquals: {
      value: function notEquals(otherValue, otherValueLabel) {
        this.passes(new EqualityRule(otherValue, false, otherValueLabel));
        return this;
      },
      writable: true,
      configurable: true
    },
    email: {
      value: function email() {
        this.passes(new RegexValidationRule(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/));
        return this;
      },
      writable: true,
      configurable: true
    },
    minLength: {
      value: function minLength(minimumValue) {
        this.passes(new MiminumLengthValidationRule(minimumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    maxLength: {
      value: function maxLength(maximumValue) {
        this.passes(new MaximumLengthValidationRule(maximumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    isNumeric: {
      value: function isNumeric() {
        this.matches(/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/);
        this.passes(new NumericValidationRule());
        return this;
      },
      writable: true,
      configurable: true
    },
    matchesRegex: {
      value: function matchesRegex(regexString) {
        this.matches(new RegExp(regexString));
        return this;
      },
      writable: true,
      configurable: true
    },
    matches: {
      value: function matches(regex) {
        this.passes(new RegexValidationRule(regex));
        return this;
      },
      writable: true,
      configurable: true
    },
    passes: {
      value: function passes(validationRule) {
        var validationProperty = this.validationProperties[this.validationProperties.length - 1];
        validationProperty.addValidationRule(validationRule);
      },
      writable: true,
      configurable: true
    }
  });

  return ValidationGroup;
})();
var ValidationProperty = exports.ValidationProperty = (function () {
  function ValidationProperty(observerLocator, propertyName, validationGroup, validationUtilities) {
    var _this = this;
    _classCallCheck(this, ValidationProperty);

    this.validationUtilities = validationUtilities;
    this.propertyName = propertyName;
    this.validationGroup = validationGroup;
    this.isValid = true;
    this.isRequired = false;
    this.message = "";
    this.validationRules = [];
    this.onValidateCallbacks = [];
    this.observer = observerLocator.getObserver(validationGroup.subject, propertyName);

    this.observer.subscribe(function (newValue, oldValue) {
      _this.validate(newValue, true);
    });
    this.isDirty = false;
  }

  _prototypeProperties(ValidationProperty, null, {
    onValidate: {
      value: function onValidate(onValidateCallback) {
        this.onValidateCallbacks.push(onValidateCallback);
      },
      writable: true,
      configurable: true
    },
    addValidationRule: {
      value: function addValidationRule(validationRule) {
        if (validationRule.validate === undefined) throw new exception("That's not a valid validationRule");
        this.validationRules.push(validationRule);
        this.validateCurrentValue(false);
      },
      writable: true,
      configurable: true
    },
    validateCurrentValue: {
      value: function validateCurrentValue(forceDirty) {
        this.validate(this.observer.getValue(), forceDirty);
      },
      writable: true,
      configurable: true
    },
    validate: {
      value: function validate(newValue, shouldBeDirty) {
        var shouldBeValid = true;
        var shouldBeMessage = "";
        if (this.validationUtilities.isEmptyValue(newValue)) {
          shouldBeValid = !this.isRequired;
          shouldBeMessage = "is required";
        } else {
          for (var i = 0; i < this.validationRules.length; i++) {
            var rule = this.validationRules[i];
            if (!rule.validate(newValue)) {
              shouldBeValid = false;
              shouldBeMessage = rule.explain();
              break;
            }
          }
          ;
        }

        var notifyObservers = !this.isDirty && shouldBeDirty || this.isValid !== shouldBeValid || this.message !== shouldBeMessage;


        this.message = shouldBeMessage;
        this.isValid = shouldBeValid;
        if (shouldBeDirty) this.isDirty = true;

        if (notifyObservers) {
          for (var i = 0; i < this.onValidateCallbacks.length; i++) {
            var callback = this.onValidateCallbacks[i];
            callback(this);
          }
        }
        this.validationGroup.checkValidity();
      },
      writable: true,
      configurable: true
    },
    notEmpty: {
      value: function notEmpty() {
        this.isRequired = true;
        this.validateCurrentValue();
      },
      writable: true,
      configurable: true
    }
  });

  return ValidationProperty;
})();
var ValidationRule = exports.ValidationRule = (function () {
  function ValidationRule(treshold, message, onValidate) {
    _classCallCheck(this, ValidationRule);

    this.onValidate = onValidate;
    this.treshold = treshold;
    this.message = message;
    this.errorMessage = null;
  }

  _prototypeProperties(ValidationRule, null, {
    withMessage: {
      value: function withMessage(message) {
        this.message = message;
      },
      writable: true,
      configurable: true
    },
    explain: {
      value: function explain() {
        return this.errorMessage;
      },
      writable: true,
      configurable: true
    },
    validate: {
      value: function validate(currentValue) {
        if (typeof currentValue === "string") {
          if (String.prototype.trim) {
            currentValue = currentValue.trim();
          } else {
            currentValue = currentValue.replace(/^\s+|\s+$/g, "");
          }
        }
        var result = this.onValidate(currentValue, this.treshold);
        if (result) {
          this.errorMessage = null;
        } else {
          this.errorMessage = this.message(currentValue, this.treshold);
        }
        return result;
      },
      writable: true,
      configurable: true
    }
  });

  return ValidationRule;
})();
var MiminumLengthValidationRule = exports.MiminumLengthValidationRule = (function (ValidationRule) {
  function MiminumLengthValidationRule(minimumLength) {
    _classCallCheck(this, MiminumLengthValidationRule);

    _get(Object.getPrototypeOf(MiminumLengthValidationRule.prototype), "constructor", this).call(this, minimumLength, function (newValue, minimumLength) {
      return "needs to be at least " + minimumLength + " characters long";
    }, function (newValue, minimumLength) {
      return newValue.length !== undefined && newValue.length >= minimumLength;
    });
  }

  _inherits(MiminumLengthValidationRule, ValidationRule);

  return MiminumLengthValidationRule;
})(ValidationRule);
var MaximumLengthValidationRule = exports.MaximumLengthValidationRule = (function (ValidationRule) {
  function MaximumLengthValidationRule(maximumLength) {
    _classCallCheck(this, MaximumLengthValidationRule);

    _get(Object.getPrototypeOf(MaximumLengthValidationRule.prototype), "constructor", this).call(this, maximumLength, function (newValue, maximumLength) {
      return "cannot be longer then " + maximumLength + " characters";
    }, function (newValue, maximumLength) {
      return newValue.length !== undefined && newValue.length < maximumLength;
    });
  }

  _inherits(MaximumLengthValidationRule, ValidationRule);

  return MaximumLengthValidationRule;
})(ValidationRule);
var NumericValidationRule = exports.NumericValidationRule = (function (ValidationRule) {
  function NumericValidationRule() {
    _classCallCheck(this, NumericValidationRule);

    _get(Object.getPrototypeOf(NumericValidationRule.prototype), "constructor", this).call(this, null, function (newValue) {
      return "must be a number";
    }, function (newValue) {
      var floatValue = parseFloat(newValue);

      var numeric = !Number.isNaN(parseFloat(newValue));
      var finite = Number.isFinite(newValue);
      return !Number.isNaN(parseFloat(floatValue)) && Number.isFinite(floatValue);
    });
  }

  _inherits(NumericValidationRule, ValidationRule);

  return NumericValidationRule;
})(ValidationRule);
var RegexValidationRule = exports.RegexValidationRule = (function (ValidationRule) {
  function RegexValidationRule(regex) {
    _classCallCheck(this, RegexValidationRule);

    _get(Object.getPrototypeOf(RegexValidationRule.prototype), "constructor", this).call(this, regex, function (newValue, regex) {
      return "not a valid value";
    }, function (newValue, regex) {
      var match = regex.test(newValue);
      return match;
    });
  }

  _inherits(RegexValidationRule, ValidationRule);

  return RegexValidationRule;
})(ValidationRule);
var MinimumValueRule = exports.MinimumValueRule = (function (ValidationRule) {
  function MinimumValueRule(minimumValue) {
    _classCallCheck(this, MinimumValueRule);

    _get(Object.getPrototypeOf(MinimumValueRule.prototype), "constructor", this).call(this, minimumValue, function (newValue, minimumValue) {
      return "needs to be " + minimumValue + " or more";
    }, function (newValue, minimumValue) {
      return minimumValue <= newValue;
    });
  }

  _inherits(MinimumValueRule, ValidationRule);

  return MinimumValueRule;
})(ValidationRule);
var MaximumValueRule = exports.MaximumValueRule = (function (ValidationRule) {
  function MaximumValueRule(maximumValue) {
    _classCallCheck(this, MaximumValueRule);

    _get(Object.getPrototypeOf(MaximumValueRule.prototype), "constructor", this).call(this, maximumValue, function (newValue, maximumValue) {
      return "needs to be less than " + maximumValue;
    }, function (newValue, maximumValue) {
      return newValue < maximumValue;
    });
  }

  _inherits(MaximumValueRule, ValidationRule);

  return MaximumValueRule;
})(ValidationRule);
var EqualityRule = exports.EqualityRule = (function (ValidationRule) {
  function EqualityRule(otherValue, equality, otherValueLabel) {
    _classCallCheck(this, EqualityRule);

    _get(Object.getPrototypeOf(EqualityRule.prototype), "constructor", this).call(this, new {
      otherValue: otherValue,
      equality: equality,
      otherValueLabel: otherValueLabel
    }(), function (newValue, treshold) {
      if (treshhold.otherValueLabel) if (treshhold.equality) return "does not match " + treshold.otherValueLabel;else return "cannot not match " + treshold.otherValueLabel;else if (treshhold.equality) return "should be " + treshold.otherValue;else return "cannot not be " + treshold.otherValue;
    }, function (newValue, treshold) {
      return treshold.equality === (newValue === treshold.otherValue);
    });
  }

  _inherits(EqualityRule, ValidationRule);

  return EqualityRule;
})(ValidationRule);
Object.defineProperty(exports, "__esModule", {
  value: true
});