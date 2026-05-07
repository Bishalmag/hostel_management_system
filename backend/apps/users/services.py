from .models import RoomAllocation

class AllocationService:

    @staticmethod
    def allocate_room(student, room_number):
        # Check if student already has a room
        existing = RoomAllocation.objects.filter(
            student=student,
            is_active=True
        ).first()

        if existing:
            raise ValueError("Student already has an active room!")

        # Create new allocation
        allocation = RoomAllocation.objects.create(
            student=student,
            room_number=room_number
        )
        return allocation

    @staticmethod
    def deallocate_room(student_id):
        RoomAllocation.objects.filter(
            student_id=student_id,
            is_active=True
        ).update(is_active=False)