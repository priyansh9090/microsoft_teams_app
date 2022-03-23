from django.urls import re_path


from . import consumers


websocket_urlpatterns = [
    re_path(r'ws/(?P<room_name>\w+)/(?P<username>\w+)/$',
            consumers.VideoConsumer.as_asgi()),
]