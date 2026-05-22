from rest_framework.routers import DefaultRouter
from .views import HostelViewSet, BlockViewSet, FloorViewSet, RoomViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register('hostels', HostelViewSet, basename='hostels')
router.register('blocks',  BlockViewSet,  basename='blocks')
router.register('floors',  FloorViewSet,  basename='floors')
router.register('rooms',   RoomViewSet,   basename='rooms')
urlpatterns = router.urls