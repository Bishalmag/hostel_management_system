from django.apps import AppConfig

class HostelConfig(AppConfig):
    name = 'apps.hostel'
    label = 'hostel'

    def ready(self):
        import apps.hostel.signals  