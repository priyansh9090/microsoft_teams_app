from django.urls import path
from . import views


urlpatterns = [
    path("login/", views.login, name="login"),
    path("signup/", views.signup, name="signup"),
    path("profile/<str:username>/", views.profile, name="profile"),
    path("logout/", views.logout, name="logout"),
    path("call/", views.call, name="call"),
    path('index/', views.index, name='index'),
    path("<str:room_name>/<str:username>/", views.room, name="room"),

]
