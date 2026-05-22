from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, DisciplinaryActionViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register('complaints', ComplaintViewSet, basename='complaints')
router.register('actions',    DisciplinaryActionViewSet, basename='actions')
urlpatterns = router.urls