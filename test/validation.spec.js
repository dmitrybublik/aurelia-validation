//import {Behavior} from 'aurelia-framework';
import {ObserverLocator} from 'aurelia-framework'
import {Validation} from '../src/validation/validation';

console.log('Test');

class Test {

  constructor(validation, firstName){
    this.firstName = firstName;
    this.validation = validation.on(this)
      .ensure('firstName')
      .notEmpty();
  }
}

describe('Validation tests', () => {

  it('should fail if no firstName is defined', function() {
    var instance = new Test(new Validation(new ObserverLocator()), null);

    expect(instance.validation.checkAll()).toBe(false);
  });
})

