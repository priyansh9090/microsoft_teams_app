import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import video.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demo_video.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            video.routing.websocket_urlpatterns
        )
    ),
})
