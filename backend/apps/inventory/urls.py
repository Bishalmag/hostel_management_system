from django.urls import path
from . import views

app_name = 'inventory'

urlpatterns = [
    # Item endpoints
    path('items/', views.item_list, name='item-list'),
    path('items/create/', views.item_create, name='item-create'),
    path('items/<int:pk>/', views.item_detail, name='item-detail'),
    
    # Optimization endpoint
    path('optimize/', views.run_optimization, name='optimize'),
    
    # Session endpoints
    path('sessions/', views.session_list, name='session-list'),
    path('sessions/<int:pk>/', views.session_detail, name='session-detail'),
    path('sessions/<int:pk>/purchase/', views.mark_purchased, name='mark-purchased'),
]