# apps/hostel/management/commands/sync_room_nodes.py
from django.core.management.base import BaseCommand
from apps.hostel.models import Room, LocationNode

NAV_PURPOSES = ['reception', 'office', 'lobby', 'DI_room', 'library', 'canteen', 'hall']

class Command(BaseCommand):
    help = 'Sync LocationNodes for all non-residential rooms'

    def handle(self, *args, **options):
        self.stdout.write('🔄 Starting sync of room nodes...')
        
        # Get all rooms with navigable purposes
        rooms = Room.objects.filter(room_purpose__in=NAV_PURPOSES)
        count = rooms.count()
        
        self.stdout.write(f'📊 Found {count} rooms with navigable purposes')
        
        created = 0
        updated = 0
        errors = 0
        
        for room in rooms:
            try:
                # Get or create node
                node, node_created = LocationNode.objects.get_or_create(
                    room=room,
                    defaults={
                        'name': f"{room.get_room_purpose_display()} - {room.room_number}",
                        'node_type': 'room',
                        'block': room.floor.block if room.floor else None,
                        'floor': room.floor
                    }
                )
                
                if node_created:
                    created += 1
                    self.stdout.write(self.style.SUCCESS(
                        f'✅ Created node for {room.room_purpose} room {room.room_number}'
                    ))
                else:
                    # Update existing node
                    node.name = f"{room.get_room_purpose_display()} - {room.room_number}"
                    node.block = room.floor.block if room.floor else None
                    node.floor = room.floor
                    node.save()
                    updated += 1
                    self.stdout.write(self.style.WARNING(
                        f'🔄 Updated node for {room.room_purpose} room {room.room_number}'
                    ))
                    
            except Exception as e:
                errors += 1
                self.stdout.write(self.style.ERROR(
                    f'❌ Error for room {room.room_number}: {str(e)}'
                ))
        
        # Clean up orphaned nodes
        orphaned = LocationNode.objects.filter(room__isnull=True).delete()
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Sync complete!\n'
            f'   Created: {created}\n'
            f'   Updated: {updated}\n'
            f'   Errors: {errors}\n'
            f'   Orphaned nodes deleted: {orphaned[0]}'
        ))
        
        # Show summary
        total_nodes = LocationNode.objects.count()
        self.stdout.write(f'\n📊 Total nodes now: {total_nodes}')
