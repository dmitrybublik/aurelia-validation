export let data = {
    settings : {
        'numericRegex' : /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
    },
    messages : {
        'isRequired' : 'est obligatoire',
        'AlphaNumericOrWhitespaceValidationRule' : (newValue, threshold) => {
        	return `ne peut contenir que des caract�res de type num�rique ou alphab�tique ou avec des espaces;
        },
        'AlphaNumericValidationRule' : (newValue, threshold) => {
            return `ne peut contenir que des caract�res de type num�rique ou alphab�tique`;
        },
        'BetweenLengthValidationRule' : (newValue, threshold) => {
            return `doit �tre compris entre between ${threshold.minimumLength} et ${threshold.maximumLength} carat�res`;
        },
        'BetweenValueValidationRule' : (newValue, threshold) => {
            return `doit �tre entre ${threshold.minimumValue} et ${threshold.maximumValue}`;
        },
        'CustomFunctionValidationRule' : (newValue, threshold) => {
            return `n'est pas une valeur valide`
        },
        'DigitValidationRule' :  (newValue, threshold) => {
            return `doit contenir uniquement des valeurs nurm�rique`;
        },
        'EmailValidationRule' : (newValue, threshold) => {
            return `n'est pas une email valide`;
        },
        'EqualityValidationRule' : (newValue, threshold) => {
            if (threshold.otherValueLabel)
                if (threshold.equality)
                    return `ne correspond pas ${threshold.otherValueLabel}`;
                else
                    return `ne peut pas correspondre ${threshold.otherValueLabel}`;
            else if (threshold.equality)
                return `devrait �tre ${threshold.otherValue}`;
            else
                return `ne peut �tre ${threshold.otherValue}`;
        },
        'MinimumLengthValidationRule' : (newValue, threshold) => {
            return `doit avoir au moins ${threshold} carat�res`;
        },
        'MinimumValueValidationRule' : (newValue, threshold) => {
            return `doit �tre ${threshold} ou plus`;
        },
        'MaximumLengthValidationRule' : (newValue, threshold) => {
            return `ne peut �tre plus long que ${threshold} caract�res`;
        },
        'MaximumValueValidationRule' : (newValue, threshold) => {
            return `doit �tre moins que ${threshold}`;
        },
        'NumericValidationRule' : (newValue, threshold) => {
            return `doit �tre num�rique`;
        },
        'RegexValidationRule' : (newValue, threshold) => {
            return `n'est pas une valeur valide`;
        },
        'StrongPasswordValidationRule' : (newValue, threshold) => {
            if(threshold == 4)
                return `devrait contenir une combinaison de lettres en miniscule, majuscule, num�rique et des caract�res sp�ciaux`;
            else
                return `devrait contenir au moins ${threshold} les caract�ristiques suivants: lettres minuscule, lettres majuscule, caract�res num�rique ou scp�ciaux`;
        }
    }
}