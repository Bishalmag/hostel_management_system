from rest_framework.routers import SimpleRouter
from .views import (AllocationViewSet, RoomPreferenceViewSet,
                    StudentPreferenceViewSet, MatchingResultViewSet)

router = SimpleRouter()
router.register('allocations',          AllocationViewSet,       basename='allocations')
router.register('room-preferences',     RoomPreferenceViewSet,   basename='room-prefs')
router.register('student-preferences',  StudentPreferenceViewSet, basename='student-prefs')
router.register('matching',             MatchingResultViewSet,    basename='matching')
urlpatterns = router.urls