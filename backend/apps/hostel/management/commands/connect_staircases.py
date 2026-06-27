from django.core.management.base import BaseCommand
from apps.hostel.signals import connect_all_staircases

class Command(BaseCommand):
    help = 'Connect all floors with staircases'

    def handle(self, *args, **options):
        self.stdout.write('🪜 Connecting staircases...')
        connect_all_staircases()
        self.stdout.write(self.style.SUCCESS('✅ All staircases connected!'))