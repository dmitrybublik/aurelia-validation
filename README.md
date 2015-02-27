# aurelia-validation

[![Join the chat at https://gitter.im/janvanderhaegen/aurelia-validation](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/janvanderhaegen/aurelia-validation?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

aurelia-validation is a small validation plugin for [aurelia.io](http://aurelia.io) that uses a fluent API (currently in alpha, **API is subject to change**).
``` javascript
this.validation = validation.on(this)
                      .ensure('isAwesome')
                            .min(9000)
                      .ensure('readMe')
                            .notEmpty()
                            .minLength(5)
                      .ensure('usage')
                            .equals('simple');
```
>I live in Mexico and don't give a crap about your anal need for license files. You use, I don't care. You abuse, I shoot you. Now go grab the code and do ya hubba hubba.

# Running the tests
``` 
git pull https://github.com/janvanderhaegen/aurelia-validation
cd aurelia-validation
npm install
jspm install -y
karma start
```

# Installation


#### Install via JSPM
Go into your project and verify it's already `npm install`'ed and `jspm install`'ed. Now execute following command to install the plugin via JSPM:

```
jspm install github:janvanderhaegen/aurelia-validation
```

this will add the plugin into your `jspm_packages` folder as well as an mapping-line into your `config.js` like follows:

```
"aurelia-validation": "github:janvanderhaegen/aurelia-validation@master",
```



#### Migrate from aurelia-app to aurelia-main 
You'll need to register the plugin when your aurelia app is bootstrapping. If you have an aurelia app because you cloned a sample, there's a good chance that the app is bootstrapping based on default conventions. In that case, open your **index.html** file and look at the *body* tag.
``` html
<body aurelia-app>
```
Change the *aurelia-app* attribute to *aurelia-main*.
``` html
<body aurelia-main>
```
The aurelia framework will now bootstrap the application by looking for your **main.js** file and executing the exported *configure* method. Go ahead and add a new **main.js** file with these contents:
``` javascript
    import {LogManager} from 'aurelia-framework';
    import {ConsoleAppender} from 'aurelia-logging-console';
    
    LogManager.addAppender(new ConsoleAppender());
    LogManager.setLevel(LogManager.levels.debug);
    
    export function configure(aurelia) {
      aurelia.use
    	.defaultBindingLanguage()
    	.defaultResources()
    	.router()
    	.eventAggregator();
    
      aurelia.start().then(a => a.setRoot('app', document.body));
    }
```

#### Load the plugin
During bootstrapping phase, you can now include the validation plugin:

``` javascript
import {LogManager} from 'aurelia-framework';
import {ConsoleAppender} from 'aurelia-logging-console';

LogManager.addAppender(new ConsoleAppender());
LogManager.setLevel(LogManager.levels.debug);

export function configure(aurelia) {
  aurelia.use
    .defaultBindingLanguage()
    .defaultResources()
    .router()
    .eventAggregator()
    .plugin('aurelia-validation'); //Add this line to load the plugin

  aurelia.start().then(a => a.setRoot('app', document.body));
}
```

# Getting started

Let's set up the **welcome.js** model from the [skeleton-navigation](http://github.com/aurelia/skeleton-navigation) with some validation. 
After importing the validation plugin in our model we'll do three things: 
- add a simple validation so that both firstName and lastname are required and have to have a length between 3 and 10 characters.
- prevent the 'welcome' function from executing if the model isn't valid
- add validation messages to the view to provide hints to the end-user

The original model looks like this:
``` javacript
export class Welcome{
  constructor(){
    this.heading = 'Welcome to the Aurelia Navigation App!';
    this.firstName = 'John';
    this.lastName = 'Doe';
  }

  get fullName(){
    return `${this.firstName} ${this.lastName}`;
  }

  welcome(){
    alert(`Welcome, ${this.fullName}!`);
  }
}
```
We start with importing the validation class
``` javacript
import {Validation} from 'aurelia-validation';  
export class Welcome{
  static inject() { return [Validation]; }
  constructor(validation){
    this.heading = 'Welcome to the Aurelia Navigation App!';
    this.firstName = 'John';
    this.lastName = 'Doe';
  }

  get fullName(){
    return `${this.firstName} ${this.lastName}`;
  }

  welcome(){
    alert(`Welcome, ${this.fullName}!`);
  }
}
```
 

Great, we're all set, now let's add our first validation:
``` javascript
  constructor(validation){
    this.heading = 'Welcome to the Aurelia Navigation App!';
    this.firstName = 'John';
    this.lastName = 'Doe'; 
    
    this.validation = validation.on(this)
        .ensure('firstName') 
              .notEmpty() 
              .minLength(3)
              .maxLength(10) 
        .ensure('lastName') 
              .notEmpty() 
              .minLength(3)
              .maxLength(10) ;
  }
```
We now have a working validation, but nothing changes behaviorally. If the validation fails, there's no way to inform the end-user of his/her mistakes.
First, let's make sure that the 'welcome' function can only be executed if the validation is valid:
``` javascript
  welcome(){
    if(this.validation.checkAll()) //add this
      alert(`Welcome, ${this.fullName}! `);
  }
```
Secondly, let's provide some visual hints to the users. Open your **welcome.html** file and add the validate attached behavior:
``` html 
    <form role="form" submit.delegate="welcome()" validate.bind="validation" > 
```

Gulp watch that thing and see the validation in action!

>Note: By default, a validation message will only be shown if the user actually changes the value (ie. the field is 'dirty'). You could disable your submit function by binding it: 
```<button type=submit" disabled.bind="!validation.isValid" > ```. This has the weird user experience that when a field is not modified by the user (because you supplied a default value for example), there are no visual clues as to why the button is still disabled.
This is why I prefer the **validation.checkAll()** function. When it is called, this will explicitly evaluate each field even if it's not dirty yet, and show all succes/error messages in the UI, then return a boolean indicating whether the validation passes or fails.


>Note: the validate attached behavior uses TW Bootstrap
- it will find the *form-group* element and add the appropriate TW BS *has-error* or *has-success* classes
- it will find the labels attached to the element and append a message with the TW BS *help-block* class
- in addition, the message element will have a *aurelia-valiation-message* class. This allows you to apply specific styling. For example, to make sure that validation messages are shown next to the corresponding label, you can add this style:
``` CSS 
		.aurelia-validation-message{
			display:  inline;
			margin-left : 5px;
		} 
```

# Validation types

####notEmpty()
This is a special case, dictating that the field is 'required' and cannot be empty.
Empty means null, undefined, '', or if it has a length property (arrays and strings) that the length is > 0.
>Note: strings are always trimmed before they evaluated.
>The notEmpty rule is always checked first before any other validation rule.  This means that without the notEmpty rule, the .minLength(5) rule would consider a value of '123456' as valid because the field is allowed to be empty.

####minimum(minimumValue)
Validates that the value entered is greater than or equal to the provided *minimumValue*.

####maximum(maximumValue)
Validates that the value entered is strictly smaller than the provided *minimumValue*.

####equals(otherValue, otherValueLabel)
Validates that the value entered equals the *otherValue*. 
Optionally takes an *otherValueLabel*, which will be used in the error message.

####notEquals(otherValue, otherValueLabel)
Validates that the value entered does not equal the *otherValue*. 
Optionally takes an *otherValueLabel*, which will be used in the error message.

####email()
Validates that the value entered is a properly formed email address. 

####minLength(minimumValue)
Validates that the length of the value entered is greater than or equal to the provided *minimumValue*.

####maxLength(maximumValue)
Validates that the length of the value entered is strictly less than the provided *minimumValue*.

####isNumeric()
Validates that the value entered is numeric.
This supports propertly formatted numbers, like '-1,000.00'.

####matchesRegex(regexString)
Validates that the value entered is valid according to the provided *regexString* (string).

####matches(regex){
Validates that the value entered is valid according to the provided *regex* (RegExp).

####withMessage(message)
Adds a custom message for the previously appended validation rule. **message** is a function that generally takes two arguments: **newValue** (the value that has been evaluated) and **threshold**.

####passes(validationRule)
Validated that the message passes the provided *validationRule* (ValidationRule). See **custom validation**.


# Custom validation

#### The ValidationRule class
If you need a complex validation rule, you can extract that into a seperate class that inherits from **ValidationRule** and pass it to the *passes(validationRule)* function.
For example:
``` javascript
import {ValidationRule} from './plugins/validation/'; 
export class MiminumLengthValidationRule extends ValidationRule{
	constructor (minimumLength) {
		super(
			minimumLength,
			(newValue, threshold) => {
				return `needs to be at least ${threshold} characters long`;
			},
			(newValue, minimumLength) => {
				 return newValue.length !== undefined && newValue.length >= minimumLength;
			}
		);
	}
}
```
The ValidationRule base class needs three constructor arguments:
- **threshold**: any javascript object that will be used as the 'threshold'.
- **message**: a javascript function that takes two arguments (**newValue**: the current value that was evaluated, and **threshold**: the javascript object that you passed earlier) and returns a string that's used as the message when the property is not valid
- **onValidate**: a javascript function that takes two arguments (**newValue**: the current value that needs to be evaluated, and **threshold**: the javascript object that you passed earlier).


>Note: It's not needed to name your variables **newValue** and **threshold**, but if you don't, then custom (*withMessage*) or localized messages will not properly work.

####Custom validation functions
In addition to calling *passed(myCustomValidationRule)*, you can add custom validation functions to the **ValidationGroup** object's prototype.

``` javascript
import {Router} from 'aurelia-router';
import {ValidationGroup} from './plugins/validation/'; 

export class App {
  static inject() { return [Router]; }
  constructor(router) {
    this.router = router;
    this.router.configure(config => {
      config.title = 'Aurelia';
      config.map([
        { route: ['','welcome'],  moduleId: 'welcome',      nav: true, title:'Welcome' },
        { route: 'flickr',        moduleId: 'flickr',       nav: true },
        { route: 'child-router',  moduleId: 'child-router', nav: true, title:'Child Router' }
      ]);
    });

    ValidationGroup.prototype.SSN = function()
    {
      this.matches(/^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/)
          .withMessage((newValue, threshold) => {return `not a valid SSN`;});
      return this;
    }

  }
}

```
>Note: Your function can add custom validation rules by calling *this.passes(customValidationRule)* or any other validation function. Provide a specific error message by calling *withMessage(validationMessage)*. Your function should always end with **return this;** to enable the fluent API.

Then, when you're setting up validation, you can use your new method:
``` javascript
    this.validation = validation.on(this)
        .ensure('firstName') 
              .notEmpty() 
              .minLength(3)
              .maxLength(10) 
        .ensure('lastName') 
              .notEmpty() 
              .minLength(3)
              .maxLength(10)
        .ensure('ssn')
              .notEmpty()
              .SSN();
```
