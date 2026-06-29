# apps/bookings/urls.py
from django.urls import path
from .views import BookingViewSet, PaymentViewSet
from .admin_views import approve_booking, reject_booking, pending_bookings

urlpatterns = [
    # Booking URLs
    path('bookings/', BookingViewSet.as_view({'get': 'list', 'post': 'create'}), name='booking-list'),
    path('bookings/<int:pk>/', BookingViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='booking-detail'),
    
    # Admin Booking Management URLs
    path('bookings/pending/', pending_bookings, name='pending-bookings'),
    path('bookings/<int:booking_id>/approve/', approve_booking, name='approve-booking'),
    path('bookings/<int:booking_id>/reject/', reject_booking, name='reject-booking'),
    
    # Payment URLs
    path('payments/', PaymentViewSet.as_view({'get': 'list', 'post': 'create'}), name='payment-list'),
    path('payments/<int:pk>/', PaymentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='payment-detail'),
    path('payments/initiate/', PaymentViewSet.as_view({'post': 'initiate_esewa_payment'}), name='initiate-payment'),
    path('payment/success/', PaymentViewSet.as_view({'get': 'payment_success'}), name='payment-success'),
    path('payment/failure/', PaymentViewSet.as_view({'get': 'payment_failure'}), name='payment-failure'),
    path('payments/my-payments/', PaymentViewSet.as_view({'get': 'my_payments'}), name='my-payments'),
]