from rest_framework.routers import DefaultRouter
from .views import MaintenanceRequestViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register('', MaintenanceRequestViewSet, basename='maintenance')
urlpatterns = router.urls