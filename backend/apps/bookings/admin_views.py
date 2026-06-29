# apps/bookings/admin_views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from .models import Booking, Payment
from .serializers import BookingSerializer


@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_booking(request, booking_id):
    """
    Admin approves a booking.
    - Checks if payment has been made
    - Updates room occupancy
    - Changes booking status to 'approved'
    """
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Check if booking is already approved
        if booking.status == 'approved':
            return Response({
                'error': 'Booking is already approved'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if booking is cancelled
        if booking.status == 'cancelled':
            return Response({
                'error': 'Cannot approve a cancelled booking'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if payment has been made
        payment = Payment.objects.filter(booking=booking, paid_status='paid').first()
        if not payment:
            return Response({
                'error': 'Booking has not been paid for. Please ask the student to complete payment first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check room availability
        room = booking.room
        if room.current_occupancy >= room.capacity:
            return Response({
                'error': f'Room {room.room_number} is fully occupied (Capacity: {room.capacity})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update room occupancy
        room.current_occupancy += 1
        room.save()
        
        # Update booking status
        booking.status = 'approved'
        booking.save()
        
        return Response({
            'message': f'Booking #{booking_id} approved successfully!',
            'booking': BookingSerializer(booking).data
        })
        
    except Booking.DoesNotExist:
        return Response({
            'error': 'Booking not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_booking(request, booking_id):
    """
    Admin rejects a booking.
    - Changes booking status to 'rejected'
    - No occupancy changes needed
    """
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Check if booking is already approved
        if booking.status == 'approved':
            # If approved, we need to decrement occupancy
            room = booking.room
            if room.current_occupancy > 0:
                room.current_occupancy -= 1
                room.save()
        
        # Update booking status
        booking.status = 'rejected'
        booking.save()
        
        return Response({
            'message': f'Booking #{booking_id} rejected successfully!',
            'booking': BookingSerializer(booking).data
        })
        
    except Booking.DoesNotExist:
        return Response({
            'error': 'Booking not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def pending_bookings(request):
    """
    Get all pending bookings that need admin approval
    """
    pending_bookings = Booking.objects.filter(status='pending')
    
    # Check which ones have been paid
    bookings_data = []
    for booking in pending_bookings:
        payment = Payment.objects.filter(booking=booking, paid_status='paid').first()
        bookings_data.append({
            'booking': BookingSerializer(booking).data,
            'is_paid': payment is not None,
            'payment': PaymentSerializer(payment).data if payment else None
        })
    
    return Response(bookings_data)