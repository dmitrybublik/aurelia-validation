"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ObserverLocator = require("aurelia-binding").ObserverLocator;
var ValidationLocaleRepository = exports.ValidationLocaleRepository = (function () {
  function ValidationLocaleRepository() {
    var lang = arguments[0] === undefined ? "en-US" : arguments[0];
    _classCallCheck(this, ValidationLocaleRepository);

    load(lang);
  }

  _prototypeProperties(ValidationLocaleRepository, null, {
    loadResource: {
      value: function loadResource() {
        var self = this;
        return new Promise(function (resolve, reject) {
          if (self.data !== null) {
            resolve(true);
            return;
          }

          System["import"]("./src/resources/" + self.activeLanguage).then(function (resource) {
            self.data = resource.data;
            resolve(true);
          });
        });
      },
      writable: true,
      configurable: true
    },
    reset: {
      value: function reset() {
        load("en-US");
      },
      writable: true,
      configurable: true
    },
    load: {
      value: function load(lang) {
        this.activeLanguage = lang;
        this.data = null;
        this.loadResource();
      },
      writable: true,
      configurable: true
    },
    tr: {
      value: function tr(what) {
        var self = this;
        return new Promise(function (resolve, reject) {
          self.loadResource().then(function (response) {
            resolve(self.data[what]);
          });
        });
      },
      writable: true,
      configurable: true
    }
  });

  return ValidationLocaleRepository;
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
        return new ValidationGroup(subject, this.observerLocator);
      },
      writable: true,
      configurable: true
    }
  });

  return Validation;
})();


Validation.Utilities = {
  isEmptyValue: function isEmptyValue(val) {
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
  }
};
Validation.Locale = new ValidationLocaleRepository();


var ValidationGroup = exports.ValidationGroup = (function () {
  function ValidationGroup(subject, observerLocator) {
    _classCallCheck(this, ValidationGroup);

    this.observerLocator = observerLocator;
    this.isValid = true;
    this.subject = subject;
    this.validationProperties = [];
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
        return this.isValid;
      },
      writable: true,
      configurable: true
    },
    ensure: {
      value: function ensure(propertyName) {
        this.validationProperties.push(new ValidationProperty(this.observerLocator, propertyName, this));
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
        this.passes(new MinimumValueValidationRule(minimumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    between: {
      value: function between(minimumValue, maximumValue) {
        this.passes(new BetweenValueValidationRule(minimumValue, maximumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    maximum: {
      value: function maximum(maximumValue) {
        this.passes(new MaximumValueValidationRule(maximumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    equals: {
      value: function equals(otherValue, otherValueLabel) {
        this.passes(new EqualityValidationRule(otherValue, true, otherValueLabel));
        return this;
      },
      writable: true,
      configurable: true
    },
    notEquals: {
      value: function notEquals(otherValue, otherValueLabel) {
        this.passes(new EqualityValidationRule(otherValue, false, otherValueLabel));
        return this;
      },
      writable: true,
      configurable: true
    },
    email: {
      value: function email() {
        this.passes(new EmailValidationRule());
        return this;
      },
      writable: true,
      configurable: true
    },
    minLength: {
      value: function minLength(minimumValue) {
        this.passes(new MinimumLengthValidationRule(minimumValue));
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
    betweenLength: {
      value: function betweenLength(minimumValue, maximumValue) {
        this.passes(new BetweenLengthValidationRule(minimumValue, maximumValue));
        return this;
      },
      writable: true,
      configurable: true
    },
    isNumeric: {
      value: function isNumeric() {
        this.passes(new NumericValidationRule());
        return this;
      },
      writable: true,
      configurable: true
    },
    isDigit: {
      value: function isDigit() {
        this.passes(new DigitValidationRule());
        return this;
      },
      writable: true,
      configurable: true
    },
    isAlphanumeric: {
      value: function isAlphanumeric() {
        this.passes(new AlphaNumericValidationRule());
        return this;
      },
      writable: true,
      configurable: true
    },
    isAlphanumericOrWhitespace: {
      value: function isAlphanumericOrWhitespace() {
        this.passes(new AlphaNumericOrWhitespaceValidationRule());
        return this;
      },
      writable: true,
      configurable: true
    },
    isStrongPassword: {
      value: function isStrongPassword(minimumComplexityLevel) {
        this.passes(new StrongPasswordValidationRule(minimumComplexityLevel));
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
        return this;
      },
      writable: true,
      configurable: true
    }
  });

  return ValidationGroup;
})();
var ValidationProperty = exports.ValidationProperty = (function () {
  function ValidationProperty(observerLocator, propertyName, validationGroup) {
    var _this2 = this;
    _classCallCheck(this, ValidationProperty);

    this.propertyName = propertyName;
    this.validationGroup = validationGroup;
    this.isValid = true;
    this.isRequired = false;
    this.message = "";
    this.validationRules = [];
    this.onValidateCallbacks = [];
    this.observer = observerLocator.getObserver(validationGroup.subject, propertyName);

    this.observer.subscribe(function (newValue, oldValue) {
      _this2.validate(newValue, true);
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
        if (Validation.Utilities.isEmptyValue(newValue)) {
          shouldBeValid = !this.isRequired;
          shouldBeMessage = Validation.Locale.tr("isRequired");
        } else {
          for (var i = 0; i < this.validationRules.length; i++) {
            var rule = this.validationRules[i];
            if (!rule.validate(newValue)) {
              shouldBeValid = false;
              shouldBeMessage = rule.explain();
              break;
            }
          }
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
  function ValidationRule(threshold, message, onValidate) {
    _classCallCheck(this, ValidationRule);

    this.onValidate = onValidate;
    this.threshold = threshold;
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
        var result = this.onValidate(currentValue, this.threshold);
        if (result) {
          this.errorMessage = null;
        } else {
          this.errorMessage = this.message(currentValue, this.threshold);
        }
        return result;
      },
      writable: true,
      configurable: true
    }
  });

  return ValidationRule;
})();
var EmailValidationRule = exports.EmailValidationRule = (function (ValidationRule) {
  function EmailValidationRule() {
    var _this2 = this;
    _classCallCheck(this, EmailValidationRule);

    this.emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    _get(Object.getPrototypeOf(EmailValidationRule.prototype), "constructor", this).call(this, null, function (newValue, threshold) {
      return "not a valid email address";
    }, function (newValue, threshold) {
      return _this2.emailRegex.test(newValue);
    });
  }

  _inherits(EmailValidationRule, ValidationRule);

  return EmailValidationRule;
})(ValidationRule);
var MinimumLengthValidationRule = exports.MinimumLengthValidationRule = (function (ValidationRule) {
  function MinimumLengthValidationRule(minimumLength) {
    _classCallCheck(this, MinimumLengthValidationRule);

    _get(Object.getPrototypeOf(MinimumLengthValidationRule.prototype), "constructor", this).call(this, minimumLength, function (newValue, minimumLength) {
      return "needs to be at least " + minimumLength + " characters long";
    }, function (newValue, minimumLength) {
      return newValue.length !== undefined && newValue.length >= minimumLength;
    });
  }

  _inherits(MinimumLengthValidationRule, ValidationRule);

  return MinimumLengthValidationRule;
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
var BetweenLengthValidationRule = exports.BetweenLengthValidationRule = (function (ValidationRule) {
  function BetweenLengthValidationRule(minimumLength, maximumLength) {
    _classCallCheck(this, BetweenLengthValidationRule);

    _get(Object.getPrototypeOf(BetweenLengthValidationRule.prototype), "constructor", this).call(this, { minimumLength: minimumLength, maximumLength: maximumLength }, function (newValue, threshold) {
      return "needs to be at between " + threshold.minimumLength + " and " + threshold.maximumLength + " characters long";
    }, function (newValue, threshold) {
      return newValue.length !== undefined && newValue.length >= threshold.minimumLength && newValue.length < threshold.maximumLength;
    });
  }

  _inherits(BetweenLengthValidationRule, ValidationRule);

  return BetweenLengthValidationRule;
})(ValidationRule);
var NumericValidationRule = exports.NumericValidationRule = (function (ValidationRule) {
  function NumericValidationRule() {
    var _this2 = this;
    _classCallCheck(this, NumericValidationRule);

    this.numericRegex = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;

    _get(Object.getPrototypeOf(NumericValidationRule.prototype), "constructor", this).call(this, null, function (newValue) {
      return "must be a number";
    }, function (newValue) {
      var floatValue = parseFloat(newValue);
      return !Number.isNaN(parseFloat(floatValue)) && Number.isFinite(floatValue) && _this2.numericRegex.test(newValue);
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
      return regex.test(newValue);
    });
  }

  _inherits(RegexValidationRule, ValidationRule);

  return RegexValidationRule;
})(ValidationRule);
var MinimumValueValidationRule = exports.MinimumValueValidationRule = (function (ValidationRule) {
  function MinimumValueValidationRule(minimumValue) {
    _classCallCheck(this, MinimumValueValidationRule);

    _get(Object.getPrototypeOf(MinimumValueValidationRule.prototype), "constructor", this).call(this, minimumValue, function (newValue, minimumValue) {
      return "needs to be " + minimumValue + " or more";
    }, function (newValue, minimumValue) {
      return minimumValue <= newValue;
    });
  }

  _inherits(MinimumValueValidationRule, ValidationRule);

  return MinimumValueValidationRule;
})(ValidationRule);
var MaximumValueValidationRule = exports.MaximumValueValidationRule = (function (ValidationRule) {
  function MaximumValueValidationRule(maximumValue) {
    _classCallCheck(this, MaximumValueValidationRule);

    _get(Object.getPrototypeOf(MaximumValueValidationRule.prototype), "constructor", this).call(this, maximumValue, function (newValue, maximumValue) {
      return "needs to be less than " + maximumValue;
    }, function (newValue, maximumValue) {
      return newValue < maximumValue;
    });
  }

  _inherits(MaximumValueValidationRule, ValidationRule);

  return MaximumValueValidationRule;
})(ValidationRule);
var BetweenValueValidationRule = exports.BetweenValueValidationRule = (function (ValidationRule) {
  function BetweenValueValidationRule(minimumValue, maximumValue) {
    _classCallCheck(this, BetweenValueValidationRule);

    _get(Object.getPrototypeOf(BetweenValueValidationRule.prototype), "constructor", this).call(this, { minimumValue: minimumValue, maximumValue: maximumValue }, function (newValue, threshold) {
      return "needs to be between " + threshold.minimumValue + " and " + threshold.maximumValue;
    }, function (newValue, threshold) {
      return threshold.minimumValue <= newValue && newValue < threshold.maximumValue;
    });
  }

  _inherits(BetweenValueValidationRule, ValidationRule);

  return BetweenValueValidationRule;
})(ValidationRule);
var DigitValidationRule = exports.DigitValidationRule = (function (ValidationRule) {
  function DigitValidationRule() {
    var _this2 = this;
    _classCallCheck(this, DigitValidationRule);

    this.digitRegex = /^\d+$/;
    _get(Object.getPrototypeOf(DigitValidationRule.prototype), "constructor", this).call(this, null, function (newValue, threshold) {
      return "can contain only digits";
    }, function (newValue, threshold) {
      return _this2.digitRegex.test(newValue);
    });
  }

  _inherits(DigitValidationRule, ValidationRule);

  return DigitValidationRule;
})(ValidationRule);
var AlphaNumericValidationRule = exports.AlphaNumericValidationRule = (function (ValidationRule) {
  function AlphaNumericValidationRule() {
    var _this2 = this;
    _classCallCheck(this, AlphaNumericValidationRule);

    this.alphaNumericRegex = /^[a-z0-9]+$/i;
    _get(Object.getPrototypeOf(AlphaNumericValidationRule.prototype), "constructor", this).call(this, null, function (newValue, threshold) {
      return "can contain only alphanumerical characters";
    }, function (newValue, threshold) {
      return _this2.alphaNumericRegex.test(newValue);
    });
  }

  _inherits(AlphaNumericValidationRule, ValidationRule);

  return AlphaNumericValidationRule;
})(ValidationRule);
var AlphaNumericOrWhitespaceValidationRule = exports.AlphaNumericOrWhitespaceValidationRule = (function (ValidationRule) {
  function AlphaNumericOrWhitespaceValidationRule() {
    var _this2 = this;
    _classCallCheck(this, AlphaNumericOrWhitespaceValidationRule);

    this.alphaNumericRegex = /^[a-z0-9\s]+$/i;
    _get(Object.getPrototypeOf(AlphaNumericOrWhitespaceValidationRule.prototype), "constructor", this).call(this, null, function (newValue, threshold) {
      return "can contain only alphanumerical characters or spaces";
    }, function (newValue, threshold) {
      return _this2.alphaNumericRegex.test(newValue);
    });
  }

  _inherits(AlphaNumericOrWhitespaceValidationRule, ValidationRule);

  return AlphaNumericOrWhitespaceValidationRule;
})(ValidationRule);
var StrongPasswordValidationRule = exports.StrongPasswordValidationRule = (function (ValidationRule) {
  function StrongPasswordValidationRule(minimumComplexityLevel) {
    _classCallCheck(this, StrongPasswordValidationRule);

    var complexityLevel = 4;
    if (minimumComplexityLevel && minimumComplexityLevel > 1 && minimumComplexityLevel < 4) complexityLevel = minimumComplexityLevel;


    _get(Object.getPrototypeOf(StrongPasswordValidationRule.prototype), "constructor", this).call(this, complexityLevel, function (newValue, threshold) {
      if (threshold == 4) return "should contain a combination of lowercase letters, uppercase letters, digits and special characters";else return "should contain at least " + threshold + " of the following groups: lowercase letters, uppercase letters, digits and special characters";
    }, function (newValue, threshold) {
      if (typeof newValue !== "string") return false;
      var strength = 0;

      strength += /[A-Z]+/.test(newValue) ? 1 : 0;
      strength += /[a-z]+/.test(newValue) ? 1 : 0;
      strength += /[0-9]+/.test(newValue) ? 1 : 0;
      strength += /[\W]+/.test(newValue) ? 1 : 0;
      return strength >= threshold;
    });
  }

  _inherits(StrongPasswordValidationRule, ValidationRule);

  return StrongPasswordValidationRule;
})(ValidationRule);
var EqualityValidationRule = exports.EqualityValidationRule = (function (ValidationRule) {
  function EqualityValidationRule(otherValue, equality, otherValueLabel) {
    _classCallCheck(this, EqualityValidationRule);

    _get(Object.getPrototypeOf(EqualityValidationRule.prototype), "constructor", this).call(this, {
      otherValue: otherValue,
      equality: equality,
      otherValueLabel: otherValueLabel
    }, function (newValue, threshold) {
      if (threshold.otherValueLabel) if (threshold.equality) return "does not match " + threshold.otherValueLabel;else return "cannot not match " + threshold.otherValueLabel;else if (threshold.equality) return "should be " + threshold.otherValue;else return "cannot not be " + threshold.otherValue;
    }, function (newValue, threshold) {
      if (newValue instanceof Date && threshold.otherValue instanceof Date) return threshold.equality === (newValue.getTime() === threshold.otherValue.getTime());
      return threshold.equality === (newValue === threshold.otherValue);
    });
  }

  _inherits(EqualityValidationRule, ValidationRule);

  return EqualityValidationRule;
})(ValidationRule);
Object.defineProperty(exports, "__esModule", {
  value: true
});