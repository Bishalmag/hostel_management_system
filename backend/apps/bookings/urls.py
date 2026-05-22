from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, PaymentViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register('bookings', BookingViewSet, basename='bookings')
router.register('payments', PaymentViewSet, basename='payments')
urlpatterns = router.urls