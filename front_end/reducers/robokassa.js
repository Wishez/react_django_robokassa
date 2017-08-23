import { 
	PROCEED_TO_PAYMENT,
	SUCCESS_PAYNMENT,
	FAILURE_PAYNMENT
} from './../constants/robokassaTypes.js';

export const robokassaInitState = {
	InvDesc: '',
	OutSum: 0,
	Email: '',
	robokassaMessage: '',
	isRedirecting: false
};

const robokassa = (
	state=robokassaInitState,
	action
) => {
	switch (action.type) {
		case PROCEED_TO_PAYMENT:
			return {
				...state,
				...action.data,
				robokassaMessage: action.robokassaMessage,
				isRedirecting: true
			};
		case SUCCESS_PAYNMENT:
			return {
				...state,
				...action.data,
				robokassaMessage: action.robokassaMessage
			};
		case FAILURE_PAYNMENT:
			return {
				...state,
				...action.data,
				robokassaMessage: action.robokassaMessage,
				isRedirecting: false
			};
		default:
			return state;
	}
};

export default robokassa;