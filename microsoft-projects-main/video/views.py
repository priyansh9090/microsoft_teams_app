from django.shortcuts import render, redirect
from django.contrib.auth.models import auth, User, Group


# Create your views here.


def login(request):
    if request.method == "GET":
        return render(request, "login.html")
    else:
        password = request.POST["psw"]
        username = request.POST["username"]

        user = auth.authenticate(
            password=password, username=username)
        if user is not None:
            auth.login(request, user)
            return redirect("/profile/username="+user.username)
        else:
            return redirect('/signup/')


def signup(request):
    if request.method == "POST":
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        username = request.POST.get('username')
        password1 = request.POST.get("psw")
        password2 = request.POST.get("psw-repeat")
        if password1 == password2:
            user = User.objects.create_user(
                email=email, password=password1, first_name=first_name, last_name=last_name, username=username)
            user.save()
            return render(request, "login.html")
        else:
            return render(request, "signup.html")
    else:
        return render(request, "signup.html")


def profile(request, username):
    return render(request, "profile.html")


def call(request):
    if request.method == "GET":
        return render(request, "call.html")
    else:
        q = request.POST['search']
        if q == "":
            return render(request, "call.html")
        else:
            posts = User.objects.filter(username__contains=q)
            return render(request, 'call.html', {'peer': posts})


def index(request):
    if request.method == "GET":
        return render(request, "index.html")
    else:
        room = request.POST['room_name']
        username = request.POST["username"]
        return redirect('/'+room+'/'+username+'/')


def chat(request, room_name):
    if request.method == "GET":
        return render(request, "chat.html", {'room_name': room_name})


def room(request, room_name, username):
    context = {'room_name': room_name, 'username': username}
    return render(request, 'room.html', context=context)


def logout(request):
    auth.logout(request)
    return redirect("/login/")
