from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'', ComplaintViewSet, basename='complaints')

urlpatterns = router.urls