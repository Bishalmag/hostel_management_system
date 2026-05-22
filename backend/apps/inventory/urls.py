from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, ProcurementPlanViewSet, SelectedItemViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register('items',    ItemViewSet,    basename='items')
router.register('plans',    ProcurementPlanViewSet, basename='plans')
router.register('selected', SelectedItemViewSet, basename='selected')
urlpatterns = router.urls