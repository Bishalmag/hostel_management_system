from rest_framework.routers import DefaultRouter
from .views import DisciplinaryActionViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register('actions',    DisciplinaryActionViewSet, basename='actions')
urlpatterns = router.urls