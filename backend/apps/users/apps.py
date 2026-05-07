from django.apps import AppConfig

class AllocationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'        # must match folder path
    label = 'users'            # unique label