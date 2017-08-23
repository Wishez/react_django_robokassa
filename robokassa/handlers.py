#coding: utf-8

import sys
from hashlib import md5
from django import forms
if sys.version_info[0] < 3:
    from urllib import urlencode
else:
    from urllib.parse import urlencode

from robokassa.conf import LOGIN, PASSWORD1, PASSWORD2, TEST_MODE
from robokassa.conf import STRICT_CHECK, FORM_TARGET, EXTRA_PARAMS
from robokassa.models import SuccessNotification



class BaseRobokassaHandler():
    def __init__(self, **kwargs):
        # Определённые параметры
        # login магазина в обменном пункте
        self.MerchantLogin = LOGIN
        # ip конечного пользователя
        # он должен быть встроен в  расчет контрольной суммы
        self.UserIp = None
        # Валюта, в которой оплачивается сумма OutSum(USD, EUR и KZT.)
        self.OutSumCurrency = None

        # Переопределение/инциализация словарём
        # значений обработчика для некоторых свойств
        if kwargs:
           for key in EXTRA_PARAMS:
               setattr(self, 'shp_' + key, kwargs[key])




    # Присоединяет дополнительные параметры к строке запроса, после значения SignatureValue.
    # посылваемой на сервер агрегатора.
    def _append_extra_part_to_query_string(self, standard_part):
        extra_part = urlencode(self.extra_params())

        if extra_part:
            return '&'.join([standard_part, extra_part])
        return standard_part
    # Присоединяет дополнительные параметры к hash сумме в значение SignatureValue.
    def _append_extra_part_to_hash(self, standart_part):
        # Получает
        def _key_value(name):
            name = 'shp_' + name
            value = getattr(self, name)
            if value:
                return '%s=%s' % (name, value)
            return ''

        extra_part = ':'.join([_key_value(key) for key in EXTRA_PARAMS])
        if extra_part:
            return ':'.join([standart_part, extra_part]).encode()

        return standart_part.encode()


    # Возвращает объект с дополнительными параметрами.
    def extra_params(self):
        extra = {}
        for param in EXTRA_PARAMS:
            if ('shp_' + param) in self.__dict__:
                extra['shp_' + param] = getattr(self, 'shp_' + param)
        return extra

    def _get_signature(self):
        return md5(self._get_signature_string()).hexdigest()

    def _get_signature_string(self):
        raise NotImplementedError

class RobokassaHandler(BaseRobokassaHandler):

    # Параметр с URL'ом, на который форма должны быть отправлена.
    # Может пригодиться для использования в шаблоне.

    def __init__(self, OutSum, InvDesc, InvId=0, Email='', **kwargs):
        # Определяемые параметры
        # требуемая к получению сумма
        self.OutSum = OutSum
        # описание покупки
        self.InvDesc = InvDesc

        # Необязательные параметры
        # предлагаемая валюта платежа
        # self.IncCurrLabel = ''
        # номер счета в магазине (должен быть уникальным для магазина)
        self.InvId = InvId
        # предлагаемая валюта платежа
        self.IncCurrLabel = None
        # e-mail пользователя
        self.Email = Email
        # язык общения с клиентом (en или ru)
        self.Culture = 'ru'
        # Инициализация до расчёта хэш суммы.
        BaseRobokassaHandler.__init__(self, **kwargs)

        # контрольная сумма MD5
        self.SignatureValue = self._get_signature()
        self.target = FORM_TARGET
        if TEST_MODE:
            self.isTest = 1
        else:
            self.isTest = ''

            # r = RobokassaHandler(**{"OutSum": 200, "InvDesc":'Item', "InvId":0, "Email":'shiningfinger@list.ru', "username":'commandos'})
            # r.get_redirect_url()
    # MerchantLogin OutSum InvDesc InvId SignatureValue
    def get_redirect_url(self):
        """ Получить URL с GET-параметрами, определёнными при создание объекта обработчика
        данных робокассы(RobokassaHandler), внутри функции обработки формы оплаты.
        Редирект на адрес, возвращаемый этим методом, эквивалентен ручной
        отправке формы методом GET.
        """

        def _initial(name):
            value = getattr(self, name)
            if value:
                return (name, value,)
            return ''

        standart_part = urlencode([
            _initial('MerchantLogin'),
            _initial('OutSum'),
            _initial('InvId'),
            _initial('InvDesc'),
            _initial('SignatureValue'),
            _initial('Email'),
            _initial('Culture'),
            _initial('isTest')
        ])

        query_string = self._append_extra_part_to_query_string(standart_part)

        return self.target+'?'+query_string

    def _get_signature_string(self):
        def _val(name):
            value = getattr(self, name)
            if value is None:
                return ''
            # Некоторые значения свойств могут быть не строковыми.
            return str(value)
        params = [_val('MerchantLogin'), _val('OutSum'), _val('InvId'), PASSWORD1]
        standard_part = ':'.join(params)
        return self._append_extra_part_to_hash(standard_part)


class ResultURLHandler(BaseRobokassaHandler):
    '''Обработчк приема результатов и проверки контрольной суммы '''
    def __init__(self, OutSum, InvId, SignatureValue, **kwargs):
        self.OutSum = OutSum
        self.InvId = InvId
        self.SignatureValue = SignatureValue
        # Получая данные от агрегатора, он послыет дополнительные,
        # определённые вами параметры с перфиксом shp_, а инициализирует
        # этот объект, как раз его отосланные данные.
        if kwargs:
            if EXTRA_PARAMS:
                for key in EXTRA_PARAMS:
                    setattr(self, 'shp_' + key, kwargs['shp_' + key])

        # Инициализация дополнительных свойсв.
        BaseRobokassaHandler.__init__(self)

    def clean(self):
        try:
            signature = getattr(self, 'SignatureValue')
            if signature != self._get_signature():
                raise
        except KeyError:
            raise

        return True

    def _get_signature_string(self):
        _val = lambda name: getattr(self, name)
        standard_part = ':'.join([_val('OutSum'), _val('InvId'), PASSWORD2])
        return self._append_extra_part_to_hash(standard_part)
#
class SuccessHandler(ResultURLHandler):
    def __init__(self, OutSum, SignatureValue, InvId = '', **kwargs):
        ResultURLHandler.__init__(self, OutSum, InvId, SignatureValue, **kwargs)

    def _get_signature_string(self):
        _val = lambda name: getattr(self, name)
        standard_part = ':'.join([_val('OutSum'), _val('InvId'), PASSWORD1])
        return self._append_extra_part_to_hash(standard_part)

    def check(self):
        data = super(SuccessHandler, self).clean()

        if STRICT_CHECK:
            if not SuccessNotification.objects.filter(InvId=data['InvId']):
                raise # forms.ValidationError(u'От ROBOKASSA не было предварительного уведомления')
        return True

class FailureHandler(ResultURLHandler):
    '''Обработчик неудачной оплаты'''

    def __init__(self, OutSum, SignatureValue='', InvId='', **kwargs):
        ResultURLHandler.__init__(self, OutSum, InvId, SignatureValue, **kwargs)