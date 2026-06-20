from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',             admin.site.urls),
    path('api/users/',         include('apps.users.urls')),
    path('api/students/',      include('apps.students.urls')),
    path('api/hostel/',        include('apps.hostel.urls')),
    path('api/maintenance/',   include('apps.maintenance.urls')),
    path('api/bookings/',      include('apps.bookings.urls')),
    path('api/events/',        include('apps.events.urls')),
    path('api/feedback/',      include('apps.feedback.urls')),
    path('api/allocation/',    include('apps.allocation.urls')),
    path('api/notifications/', include('apps.notification.urls')),
    path('api/complaints/',    include('apps.complaints.urls')),
]
