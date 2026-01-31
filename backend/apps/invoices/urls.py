from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet

router = DefaultRouter()
router.register('', InvoiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
