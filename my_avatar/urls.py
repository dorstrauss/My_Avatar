from django.contrib import admin
from django.urls import path
from website.views import HomeView, chatbot
from my_avatar import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', HomeView.as_view(), name='home'),
    path('chatbot/', chatbot, name='chatbot'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
