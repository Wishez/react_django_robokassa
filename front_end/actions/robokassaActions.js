import { 
	PROCEED_TO_PAYMENT,
	SUCCESS_PAYNMENT,
	FAILURE_PAYNMENT
} from './../constants/robokassaTypes.js';

import customAjaxRequest from './../constants/ajax.js';

const proceedToPayment = (
	data,
	robokassaMessage
) => ({
	type: PROCEED_TO_PAYMENT,
	data,
	robokassaMessage
});

const failurePayment = (
	data,
	robokassaMessage
) => ({
	type: FAILURE_PAYNMENT,
	data,
	robokassaMessage
});

const successPayment = (
	data,
	robokassaMessage
) => ({
	type: SUCCESS_PAYNMENT,
	data,
	robokassaMessage
});
// 
export const getSuccessPaymentData = (data, url) => dispatch => {
	console.log(data);
	customAjaxRequest({
		url: url, // is getUserDataUrl
		data: data,
		type: 'GET',
        processData: true,
        cache: true
 	});
 	
 	return $.ajax({
		success: data => {
			dispatch(successPayment(
				data, 
				`Вы успешно пополнили баланс на ${data['OutSum']}₽`
			));
		},
		error: (xhr, errmsg, err) => {
			dispatch(successPayment(data, 'Внутренняя ошибка сервера'));
		}
	});
};
// Делает запрос к серверу и переводит пользователя на страницу
// оплаты платёжного агрегатор ー robokassa. Перевод пользователя
// происходит в django приложение robokassa. 
export const moveUserToPaynment = data => dispatch => {
	if (!data.OutSum)
		dispatch(proceedToPayment(data, 'Введите сумму'));

	customAjaxRequest({
		url: `/payment/proceed_to_payment/`,
		data: data,
		type: 'GET',
        processData: true,
        cache: true
 	});

	dispatch(proceedToPayment(data, 'Перенаправление...'));
	// success не обрабатывается, потому что пользователь перенаправляется
	// на страницу другого сайта.
	return $.ajax({
		success: url => {
			window.location = url;
		},
		error: (xhr, errmsg, err) => {
			dispatch(proceedToPayment(data, 'Внутренняя ошибка сервера'));
		}
	});
};