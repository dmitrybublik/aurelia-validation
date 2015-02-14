System.register(["./validation/validation"], function (_export) {
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

      ValidateAttachedBehavior = _validationValidation.ValidateAttachedBehavior;
    }],
    execute: function () {}
  };
});