from django.core.management.base import BaseCommand
from apps.inventory.models import ProcurementItem

SAMPLE_ITEMS = [
    {"name": "Single Bed Frame",       "category": "furniture",   "cost": 5000,  "utility_value": 90, "description": "Standard single bed"},
    {"name": "Study Table",            "category": "furniture",   "cost": 3500,  "utility_value": 85, "description": "Wooden study table"},
    {"name": "Study Chair",            "category": "furniture",   "cost": 1800,  "utility_value": 80, "description": "Ergonomic chair"},
    {"name": "Wardrobe (2-door)",      "category": "furniture",   "cost": 9000,  "utility_value": 75, "description": "2-door wardrobe"},
    {"name": "Mattress",               "category": "furniture",   "cost": 4500,  "utility_value": 92, "description": "6-inch foam mattress"},
    {"name": "Bunk Bed Frame",         "category": "furniture",   "cost": 8000,  "utility_value": 88, "description": "Space-saving bunk bed"},
    {"name": "WiFi Router",            "category": "electronics", "cost": 7500,  "utility_value": 95, "description": "Dual-band router"},
    {"name": "CCTV Camera",            "category": "electronics", "cost": 6000,  "utility_value": 88, "description": "HD CCTV"},
    {"name": "Water Purifier (RO)",    "category": "electronics", "cost": 14000, "utility_value": 97, "description": "RO purifier 10L"},
    {"name": "Ceiling Fan",            "category": "electronics", "cost": 3200,  "utility_value": 82, "description": "5-blade energy-efficient fan"},
    {"name": "UPS / Inverter",         "category": "electronics", "cost": 18000, "utility_value": 78, "description": "800VA UPS"},
    {"name": "Fire Extinguisher",      "category": "supplies",    "cost": 2500,  "utility_value": 99, "description": "ABC 4kg extinguisher"},
    {"name": "First Aid Kit",          "category": "supplies",    "cost": 900,   "utility_value": 94, "description": "50-piece first aid kit"},
    {"name": "Laundry Bucket Set",     "category": "supplies",    "cost": 600,   "utility_value": 60, "description": "Set of 4 buckets"},
    {"name": "Paint + Brushes",        "category": "maintenance", "cost": 2200,  "utility_value": 55, "description": "Emulsion paint for 1 room"},
]

class Command(BaseCommand):
    help = 'Seed sample procurement items'

    def handle(self, *args, **kwargs):
        created = skipped = 0
        for data in SAMPLE_ITEMS:
            _, was_created = ProcurementItem.objects.get_or_create(
                name=data['name'], defaults=data
            )
            if was_created: created += 1
            else: skipped += 1
        self.stdout.write(self.style.SUCCESS(
            f'Done. Created: {created} | Skipped: {skipped}'
        ))