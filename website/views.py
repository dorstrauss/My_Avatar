import os

from django.shortcuts import render
from django.views.generic import TemplateView

class HomeView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['DID_API'] = {'url': 'https://api.d-id.com', 'key': os.environ.get('D-ID_API_KEY')}
        return context
