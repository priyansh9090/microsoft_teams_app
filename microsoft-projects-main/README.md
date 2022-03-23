MICROSOFT TEAMS CLONE APP

With this app we can have a group video chat with other peers in the same room.
I have used Django for backend and html, css and javascript for frontend . For signalling server Websockets is used . For database Postgresql is used.
I used Django as backend because it follows DRY principle. It uses python as programming language which will demonstrate proper coding.
Websockets are used which allows more than 2 peers to connect which is quite difficult in socket.io.
This app has user authentication system.


video link:- https://www.youtube.com/watch?v=dI4tBNL4YcA

WEBPAGES IN THIS APP

Login page to login a user 

Signup page for a user to create an account in my app

Landing page 

Calls page to make a call to a particular user or group

Index page which aska for a room name to which user wants to enter

Group video chat room

URL of first page of this app for local host is http://127.0.0.0:8000/login/


WALKTHROUGH MY APP

User logins in his account or signup for a new account

Lands on landing page and clicks on calls button

Search for a username to call

Enter a room name to join in

He can talk to other peers in the same room before the meeting through chat button

He clicks on call button to join the video conferencing in that room
If he wants to end his video call  , he clicks on the hang up button and will be disconnected from the call .But he will stay in the same room .He can message to all the group members in the same room.

If a user wants to leave a room he just clicks leave room button and he will be redirected to the call room again.

LINKS WHICH I TOOK HELP FROM IN MAKING THIS APP
https://channels.readthedocs.io/en/stable/
https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Introduction
https://webrtc.github.io/samples/
https://codelabs.developers.google.com/codelabs/webrtc-web#0
https://www.w3schools.com/

AGILE METHODOLOGY USED IN THIS PROJECT
I always created small modules for every certain things which I wanted to add.
I was simultaneously working on testing my webpages eficacy,as soon as I was completing a step.
I divided my whole project in small chunks as:
first I created User authentication
then, I created Group Chat feature 
and lastly Group Video Chat Model.
