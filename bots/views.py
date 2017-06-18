from django.http import HttpRequest
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods


@require_http_methods(["GET"])
def index(request: HttpRequest) -> HttpResponse:
    props = dict(message="hello")
    return render(request, 'bots/index.html', dict(props=props))
