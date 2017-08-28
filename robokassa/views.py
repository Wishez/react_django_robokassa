#coding: utf-8

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from robokassa.conf import USE_POST, SUCCESS_URL, FAILURE_URL
from robokassa.models import SuccessNotification
from robokassa.signals import result_received, success_page_visited, fail_page_visited

from .handlers import  *
from django.shortcuts import redirect

from django.utils import timezone

def _unpack(data):
    return {name: data[name] for name in data}

@csrf_exempt
def proceed_to_payment(request):
    if request.method == 'GET':

        data = _unpack(request.GET)

        handler = RobokassaHandler(**data)

        url = handler.get_redirect_url()

        return HttpResponse(url)


# Функция, вызываемая, когда robokassa сообщает об
# успешном пополнение счёта пользователем. Предварительно,
# перед перенаправлением на страницу успешной оплаты, она 
# сохраняет данные об успешной оплате в модель SuccessNotification.
# При успешном создание объекта, активируется сигнал result_received,
# который может передать успешное уведомление и остальные данные в функцию,
# чтобы присвоить их модели пользователя. 
@csrf_exempt
def receive_result(request):
    data = _unpack(request.POST if USE_POST else request.GET)

    id, sum = int(data['InvId']), data['OutSum']
    handler = ResultURLHandler(**data)
    # сохраняем данные об успешном уведомлении в базе, чтобы
    # можно было выполнить дополнительную проверку на странице успешного
    # заказа
    notification = SuccessNotification.objects.create(InvId = id, OutSum = sum)

    # дополнительные действия с заказом (например, смену его статуса) можно
    # осуществить в обработчике сигнала robokassa.signals.result_received
    result_received.send(
        sender=notification,
        InvId=id,
        OutSum=int(sum),
        extra=handler.extra_params()
    )
    
    return HttpResponse('OK%s' % id)

# Задействуются, когда робокасса перенаправляет пользователя
# на страницу сайта успешной оплаты. Функция получает данные,
# создаёт обработчик события успешной оплаты, отправляя его 
# в сигнал, вместе с уникальныйм идентификаторы заказа и суммой
# оплаты, обрабатываемые в функции, вызваемой при получение сигнала.
# После перенаправляет на SUCCESS_URL, определённый в настройках приложения,
# тождественный successUrl в компонение SuccessPaymentRoute, ловащий этот
# url и перенаправляющий на указанный путь. 
@csrf_exempt
def success(request):
    """ обработчик для SuccessURL """
    data = _unpack(request.POST if USE_POST else request.GET)

    handler = SuccessHandler(**data)

    id, sum =  getattr(handler , 'InvId'), getattr(handler , 'OutSum')

    # Обработчик, взмен формы, проверяющий данные.
    # в случае, когда не используется строгая проверка, действия с заказом
    # можно осуществлять в обработчике сигнала robokassa.signals.success_page_visited
    success_page_visited.send(
        sender = handler,
        InvId = id,
        OutSum = int(sum),
        extra = handler.extra_params()
    )

    return redirect(SUCCESS_URL)

@csrf_exempt
def fail(request):
    """ обработчик для FailURL """

    data = _unpack(request.POST if USE_POST else request.GET)

    handler = FailureHandler(**data)

    id, sum = data['InvId'], data['OutSum']
    # дополнительные действия с заказом (например, смену его статуса для
    # разблокировки товара на складе) можно осуществить в обработчике
    # сигнала robokassa.signals.fail_page_visited
    fail_page_visited.send(
        sender = handler,
        InvId = id,
        OutSum = int(sum),
        extra = handler.extra_params())

    return redirect(FAILURE_URL)

