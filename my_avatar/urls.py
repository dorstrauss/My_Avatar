from django.contrib import admin
from django.urls import path
from website.views import HomeView, chatbot

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', HomeView.as_view(), name='home'),
    path('chatbot/', chatbot, name='chatbot'),
]
