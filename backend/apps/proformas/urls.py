from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProformaViewSet

router = DefaultRouter()
router.register('', ProformaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
