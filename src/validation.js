export * from './validation/validation';
export * from './validation/validateAttachedBehavior';

import {ValidateAttachedBehavior} from './validation/validateAttachedBehavior'

export function install(aurelia)
{
	aurelia.withResources(ValidateAttachedBehavior);
}