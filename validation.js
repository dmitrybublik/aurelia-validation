export * from './validation/validation';
import {ValidateAttachedBehavior} from './validation/validation'

export function install(aurelia)
{
	aurelia.withResources([ValidateAttachedBehavior]);
}