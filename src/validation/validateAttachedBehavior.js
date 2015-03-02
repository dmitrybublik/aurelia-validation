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