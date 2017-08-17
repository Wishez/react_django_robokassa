#coding: utf-8

from django.conf.urls import url

from . import views

urlpatterns = [
    url(
          r'^result/$',
          views.receive_result,
          name='robokassa_result'
    ),
    url(
          r'^success/$',
          views.success,
          name='robokassa_success'
    ),
    url(
          r'^fail/$',
          views.fail,
          name='robokassa_fail'
    ),
]
