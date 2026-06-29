# apps/bookings/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import redirect
from django.utils import timezone
from django.conf import settings
from .models import Booking, Payment
from .serializers import BookingSerializer, PaymentSerializer
from .esewa import generate_esewa_form
import uuid
import urllib.parse
import json
import base64

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(student__user=user)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    
    def get_permissions(self):
        """Allow public access to success/failure endpoints"""
        if self.action in ['payment_success', 'payment_failure']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return Payment.objects.all()
            return Payment.objects.filter(student__user=self.request.user)
        return Payment.objects.none()
    
    @action(detail=False, methods=['post'])
    def initiate_esewa_payment(self, request):
        """Initiate eSewa payment for a booking"""
        booking_id = request.data.get('booking_id')
        
        try:
            booking = Booking.objects.get(id=booking_id)
            
            # Check authorization
            if booking.student.user != request.user and not request.user.is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            # Check if already paid
            existing_payment = Payment.objects.filter(booking=booking, paid_status='paid').first()
            if existing_payment:
                return Response({'error': 'Payment already completed'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check room availability before allowing payment
            room = booking.room
            if room.current_occupancy >= room.capacity:
                return Response({
                    'error': f'Room {room.room_number} is no longer available. It has been fully booked.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            amount = str(float(booking.total_amount or 5000))
            transaction_uuid = str(uuid.uuid4())
            
            # Create or update payment record
            payment, created = Payment.objects.get_or_create(
                booking=booking,
                student=booking.student,
                defaults={
                    'amount': amount,
                    'due_date': booking.check_in_date,
                    'paid_status': 'pending',
                    'transaction_uuid': transaction_uuid
                }
            )
            
            if not created:
                payment.transaction_uuid = transaction_uuid
                payment.paid_status = 'pending'
                payment.save()
            
            # Generate eSewa form
            form_html = generate_esewa_form(amount, transaction_uuid)
            
            return Response({
                'payment_id': payment.id,
                'transaction_uuid': transaction_uuid,
                'amount': amount,
                'form': form_html
            })
            
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def payment_success(self, request):
        """Handle eSewa payment success callback - Public access"""
        print("=" * 50)
        print("Payment success callback received!")
        print(f"GET parameters: {dict(request.GET)}")
        print("=" * 50)
        
        # eSewa sends data as a URL-encoded base64 JSON string in the 'data' parameter
        data_param = request.GET.get('data')
        
        if data_param:
            try:
                # First URL decode
                decoded_data = urllib.parse.unquote(data_param)
                print(f"URL Decoded data: {decoded_data}")
                
                # Then base64 decode
                base64_decoded = base64.b64decode(decoded_data).decode('utf-8')
                print(f"Base64 Decoded data: {base64_decoded}")
                
                # Then parse JSON
                payment_data = json.loads(base64_decoded)
                print(f"Parsed payment data: {json.dumps(payment_data, indent=2)}")
                
                transaction_uuid = payment_data.get('transaction_uuid')
                transaction_code = payment_data.get('transaction_code')
                status = payment_data.get('status')
                total_amount = payment_data.get('total_amount')
                
                print(f"Transaction UUID: {transaction_uuid}")
                print(f"Transaction Code: {transaction_code}")
                print(f"Status: {status}")
                print(f"Total Amount: {total_amount}")
                
                if status == 'COMPLETE':
                    try:
                        payment = Payment.objects.get(transaction_uuid=transaction_uuid)
                        
                        # ❌ REMOVED: Auto-approval of booking
                        # ❌ REMOVED: Auto-update of room occupancy
                        # The booking remains 'pending' until admin approves it
                        
                        # Update payment status only
                        payment.paid_status = 'paid'
                        payment.paid_at = timezone.now()
                        payment.transaction_code = transaction_code
                        payment.save()
                        
                        print(f"✅ Payment {payment.id} marked as paid!")
                        print(f"📝 Booking #{payment.booking.id} remains '{payment.booking.status}' - awaiting admin approval")
                        
                        return redirect(f'http://localhost:5173/students/payment/success?payment_id={payment.id}')
                        
                    except Payment.DoesNotExist:
                        print(f"❌ Payment with UUID {transaction_uuid} not found")
                        return redirect('http://localhost:5173/students/payment/failure')
                else:
                    print(f"❌ Payment status: {status}")
                    return redirect('http://localhost:5173/students/payment/failure')
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error: {e}")
                return redirect('http://localhost:5173/students/payment/failure')
            except base64.binascii.Error as e:
                print(f"❌ Base64 decode error: {e}")
                return redirect('http://localhost:5173/students/payment/failure')
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                return redirect('http://localhost:5173/students/payment/failure')
        else:
            print("❌ No data parameter found")
            return redirect('http://localhost:5173/students/payment/failure')
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def payment_failure(self, request):
        """Handle eSewa payment failure callback - Public access"""
        print("Payment failure callback received!")
        print("GET parameters:", request.GET)
        return redirect('http://localhost:5173/students/payment/failure')
    
    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get payments for logged-in student"""
        payments = Payment.objects.filter(student__user=request.user)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        """Cancel a booking and decrement room occupancy"""
        try:
            booking = Booking.objects.get(id=pk)
            
            # Check if user is authorized
            if booking.student.user != request.user and not request.user.is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            # If booking was approved, decrement room occupancy
            if booking.status == 'approved':
                room = booking.room
                if room.current_occupancy > 0:
                    room.current_occupancy -= 1
                    room.save()
                    print(f"✅ Room {room.room_number} occupancy decreased to {room.current_occupancy}")
            
            # Update booking status
            booking.status = 'cancelled'
            booking.save()
            
            return Response({'message': 'Booking cancelled successfully'})
            
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)