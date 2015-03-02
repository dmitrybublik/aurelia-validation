export let data = {
    settings : {
        'numericRegex' : /^-?(?:\d+)(?:\,\d+)?$/
    },
    messages : {
        'isRequired' : 'is verplicht',
        'AlphaNumericOrWhitespaceValidationRule' : (newValue, threshold) => {
            return `kan enkel alfanumerieke tekens of spaties bevatten`;
        },
        'AlphaNumericValidationRule' : (newValue, threshold) => {
            return `kan enkel alfanumerieke tekens bevatten`;
        },
        'BetweenLengthValidationRule' : (newValue, threshold) => {
            return `moet tussen ${threshold.minimumLength} en ${threshold.maximumLength} tekens lang zijn`;
        },
        'BetweenValueValidationRule' : (newValue, threshold) => {
            return `moet tussen ${threshold.minimumValue} en ${threshold.maximumValue} zijn`;
        },
        'DigitValidationRule' :  (newValue, threshold) => {
            return `mag enkel cijfers bevatten`;
        },
        'CustomFunctionValidationRule' : (newValue, threshold) => {
            return `geen geldige waarde`
        },
        'EmailValidationRule' : (newValue, threshold) => {
            return `is geen geldig email adres`;
        },
        'EqualityValidationRule' : (newValue, threshold) => {
            if (threshold.otherValueLabel)
                if (threshold.equality)
                    return `moet overeen komen met ${threshold.otherValueLabel}`;
                else
                    return `mag niet overeen komen met ${threshold.otherValueLabel}`;
            else if (threshold.equality)
                return `moet ${threshold.otherValue} zijn`;
            else
                return `mag niet ${threshold.otherValue} zijn`;
        },
        'MinimumLengthValidationRule' : (newValue, threshold) => {
            return `moet op zijn minst ${threshold} tekens lang zijn`;
        },
        'MinimumValueValidationRule' : (newValue, threshold) => {
            return `moet op zijn minst ${threshold} zijn`;
        },
        'MaximumLengthValidationRule' : (newValue, threshold) => {
            return `moet minder dan ${threshold} tekens lang zijn`;
        },
        'MaximumValueValidationRule' : (newValue, threshold) => {
            return `moet minder dan ${threshold} zijn`;
        },
        'NumericValidationRule' : (newValue, threshold) => {
            return `moet een getal zijn`;
        },
        'RegexValidationRule' : (newValue, threshold) => {
            return `is geen geldige waarde`;
        },
        'StrongPasswordValidationRule' : (newValue, threshold) => {
            if(threshold == 4)
                return `moet een combinatie van letters, hoofdletters, cijfers en speciale tekens zijn`;
            else
                return `moet op zijn minst ${threshold} van de volgende groupen bevatten: letters, hoofdletters, cijfers of speciale tekens`;
        }
    }
};