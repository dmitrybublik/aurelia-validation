"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

exports.install = install;
var _validationValidation = require("./validation/validation");

_defaults(exports, _interopRequireWildcard(_validationValidation));

var ValidateAttachedBehavior = _validationValidation.ValidateAttachedBehavior;
function install(aurelia) {
  aurelia.withResources(ValidateAttachedBehavior);
}
Object.defineProperty(exports, "__esModule", {
  value: true
});