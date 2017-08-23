import * as Cookies from 'js-cookie';

const crossDomainRequest = (xhr, settings, that) => {		
	/* Заметка:
	 * csrftoken не всегда устанавливается сервером.
	 * Оно закэшированно, если пользователь находится в своём аккаунте
	 * Если даже csrftoken нет в кукАХ, то сервер в любом случае позволяет зарегистрироваться 
	 * используя декоратор @csrf_exempt для функции регистрации.
	 */
	const csrftoken = Cookies.get('csrftoken');
	const csrfSafeMethod = (method) => (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	if (!csrfSafeMethod(settings.type) && !that.crossDomain) {
 		xhr.setRequestHeader("X-CSRFToken", csrftoken);
	}
};

const customAjaxRequest = ({
	url,
	data,
	type,
	...rest
}) => {
	$.ajaxSetup({
		url: url,
		type: type,
		data: data,
		beforeSend(xhr, settings) {
			crossDomainRequest(xhr, settings, this);
		},
		...rest
	});

};



export default customAjaxRequest;