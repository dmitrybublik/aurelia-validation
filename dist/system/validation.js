System.register(["./validation/validation", "./validation/validateAttachedBehavior"], function (_export) {
  "use strict";

  var ValidateAttachedBehavior;
  _export("install", install);

  function install(aurelia) {
    aurelia.withResources(ValidateAttachedBehavior);
  }
  return {
    setters: [function (_validationValidation) {
      for (var _key in _validationValidation) {
        _export(_key, _validationValidation[_key]);
      }
    }, function (_validationValidateAttachedBehavior) {
      for (var _key2 in _validationValidateAttachedBehavior) {
        _export(_key2, _validationValidateAttachedBehavior[_key2]);
      }

      ValidateAttachedBehavior = _validationValidateAttachedBehavior.ValidateAttachedBehavior;
    }],
    execute: function () {}
  };
});