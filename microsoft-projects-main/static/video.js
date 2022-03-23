        'use_strict'
        
        const roomName = JSON.parse(document.getElementById('room-name').textContent);
        const username = JSON.parse(document.getElementById('username').textContent);
        const localVideo = document.getElementById('localVideo');
        const callButton = document.getElementById('callButton');
        const hangupButton = document.getElementById('hangupButton');
        const recordButton = document.querySelector('#record');
        const shareButton = document.querySelector('#screen-share');
        var btnaudio=document.querySelector("#audio");
        var btnvideo=document.querySelector("#video");

        
        // creating variables
        let localStream,remoteStream;
        var clients={};
        var senders=[];
        var clients_id=[];
        
        // to create new websocket connection
        const chatSocket = new WebSocket(
            'ws://'
            + window.location.host
            + '/ws/'
            + roomName
            + '/'+username+'/'
        );
        
        // opens the connection
        chatSocket.onopen =function(e){
            console.log("connection open");
            clients_id[username]=chatSocket;
            
        }
        //triggers whenever a message arrives
        chatSocket.onmessage = function(event){
            websocketrecievemessage(event);
            
        }
        //closes the connection
        chatSocket.onclose = function(event){
            console.log("connection closed");
        }
        //triggers when error occurs
        chatSocket.onerror = function(e) {
            console.log('error occured');
        };
        


        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
            if (e.keyCode === 13) {  // enter, return
                document.querySelector('#chat-message-submit').click();
            }
        };
        // triggers when we click "send" button to send the message to websockets
        document.querySelector('#chat-message-submit').onclick = function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            sendsignal('new-message',message);
            // chatSocket.send(JSON.stringify({'message': message}));
            messageInputDom.innerHTML = '';
        };

        //to send signal to the websockets
        function sendsignal(action,message){
            var jsonstr=JSON.stringify({
                'action':action,
                'message':message,
                'user':username,
            });
            chatSocket.send(jsonstr);
        }
        
        //media access
        const mediaStreamConstraints = {
            video: true,
            audio : true,
        };

        //stun servers for other devices to connect
        var configuration = {
            'iceServers': [{
                'urls': ['stun:stun.l.google.com:19302',
                            'stun:stun1.l.google.com:19302',
                            'stun:stun2.l.google.com:19302']
            }]
        };

        // to get local video stream and managing audio and video mute-unmute function
        function gotLocalMediaStream(mediaStream) {
            
            localVideo.srcObject = mediaStream;
            localStream = mediaStream;
            trace('Received local stream.');
            
            const videoTracks = localStream.getVideoTracks();
            const audioTracks = localStream.getAudioTracks();
            audioTracks[0].enabled=true;
            videoTracks[0].enabled=true;
            
            btnaudio.addEventListener('click',()=>{
                audioTracks[0].enabled=!audioTracks[0].enabled;
                if(audioTracks[0].enabled)
                    btnaudio.innerHTML='Audio Mute';
                else
                    btnaudio.innerHTML='Audio UnMute';

            });

            btnvideo.addEventListener('click',()=>{
                videoTracks[0].enabled=!videoTracks[0].enabled;
                if(videoTracks[0].enabled)
                    btnvideo.innerHTML='video Mute';
                else
                    btnvideo.innerHTML='video UnMute';

            });

        }

        // to make video call to others in the room

        function callAction() {
            shareButton.disabled = false;
            hangupButton.disabled=false;
            callButton.disabled = true;
            // to access local media devices
            navigator.mediaDevices.getUserMedia({
                video:true,
                audio:true
            })
            .then(gotLocalMediaStream).catch((error)=>{
                console.log("error in accessing media devices",error)
            });
            // send signal to all other peers about the arrival of new peer
            sendsignal('new-peer',{});
    
            trace('Requesting local stream.');
    
        }
        
        // offer options of media given to other peers for remote streaming 
        const offerOptions = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        };
        
        // to set remote video in one's machine
        function gotRemoteMediaStream(peer,remotevideo){
            remoteStream = new MediaStream();
            remotevideo.srcObject=remoteStream;
            peer.addEventListener('track', async (event)=>{
                remoteStream.addTrack(event.track,remoteStream);
            });
        }

        // function to create offer to new peer in the room
        function createOfferer(user,channel_name){
            // creating new peer connection
            var peer=new RTCPeerConnection(configuration);
            // adding media tracks which will be transmitted to the other peer
            addtracks(peer);
            // creating data channel associated to this new peer connection
            var dc=peer.createDataChannel('channel');
            dc.addEventListener('open',()=>{
                console.log("connection open");
            });
            dc.addEventListener('message',dconmessage);
            // creating remote video on local device
            var remotevideo=createVideo(user);
            // getting remote media stream
            gotRemoteMediaStream(peer,remotevideo);
            // adding clients to the dict with username as key and peer connection and data channel as values
            clients[user]=[peer,dc];

            // checking ice connection state 
            peer.addEventListener('iceconnectionstatechange',()=>{
                var ice=peer.iceConnectionState;
                if(ice==='failed'||ice==='closed'||ice==='disconnected'){
                    // delete the user which disconnects or close or failed
                    delete clients[user];
                    if(ice !='closed')
                        peer.close();
                    // remove this peer's video
                    removevideo(remotevideo);
                }        
            });
            // creating new ice candidates
            peer.addEventListener('icecandidate',(event)=>{
                if(event.candidate){
                    console.log("new ice candidate");
                    return;
                }
                // send offers to all new peers 
                sendsignal('new-offer',{
                    'sdp':peer.localDescription,
                    'receiver_channel_name':channel_name
                });
            });

            // creating offers
            peer.createOffer(offerOptions)
            .then(o=>{
                peer.setLocalDescription(o)
                .then(() => {
                    console.log('clients[', user, ']: ',clients[user]);

                    console.log("set local description successs");
                }).catch((error)=>{
                    console.log("error in setting local description",error);
                });
            }).catch((error)=>{
            console.log("error in creating offer",error);
            });

        }

        // triggers when new message arrives in the data channels
        function dconmessage(event){
            var message=event.data;
        }

        // creating answers to all the peers from whom we got the offer
        function createAnswerer(offer,user,channel_name){
            // creating new peer connection
            var peer=new RTCPeerConnection(configuration);
            console.log("answer from",user);
            addtracks(peer);
            
            var remotevideo=createVideo(user);
            gotRemoteMediaStream(peer,remotevideo);
    
            peer.addEventListener('datachannel',e=>{
                peer.dc=e.channel;
                peer.dc.addEventListener('open',()=>{
                console.log("connection open");
            });
            peer.dc.addEventListener('message',dconmessage);
            clients[user]=[peer,peer.dc];
    
            });
    

            peer.addEventListener('iceconnectionstatechange',()=>{
                var ice=peer.iceConnectionState;
                if(ice==='failed'||ice==='closed'||ice==='disconnected'){
                    delete clients[user];
                    if(ice !='closed')
                        peer.close();
                    removevideo(remotevideo);
                }        
            });
            peer.addEventListener('icecandidate',(event)=>{
                if(event.candidate){
                    console.log("new ice candidate");
                    return;
                }
                // sending answers to all the peers
                sendsignal('new-answer',{
                    'sdp':peer.localDescription,
                    'receiver_channel_name':channel_name
                });
            });
            trace('remotePeerConnection remote descriuption  start.');
            peer.setRemoteDescription(offer)
            .then(() => {
                console.log("remote description set success");
            }).catch((error)=>{
                console.log("error in setting remote description:",error);
            });
            
            // creating answers in response of offers
            trace('remotePeerConnection createAnswer start.');
            peer.createAnswer()
            .then(o=>{
                peer.setLocalDescription(o)
                .then(() => {
                    console.log("local desc for remote is set successful");
                }).catch((error)=>{
                    console.log("error in setting remote description:",error);
                });
            }).catch((error)=>{
                console.log("error in creating answer:",error);
            });


    
        }

        // to remove remote video
        function removevideo(remote_video){
            var parent_video=remote_video.parentNode;
            parent_video.parentNode.removeChild(parent_video);
        }

        // to create new remote video and add it to the video grid
        function createVideo(user){
            
            var videoe=document.querySelector("#video-container");
            var videoappend=document.createElement('div');
            var remotevideo = document.createElement("video");
            remotevideo.id=user + "-video";
            remotevideo.autoplay=true;
            remotevideo.playsInline=true;
            videoe.appendChild(videoappend);
            videoappend.appendChild(remotevideo);
            return remotevideo;
    
        }

        // function for sharing the screen
        function shareAction(){
            
            navigator.mediaDevices.getDisplayMedia({cursor:true})
            .then(stream=>{
                const streamtrack =stream.getTracks()[0];
                senders.find(senders=>senders.track.kind==='video').replaceTrack(streamtrack);
                localVideo.srcObject=stream;
                streamtrack.onended = function (){
                    senders.find(senders=>senders.track.kind==='video').replaceTrack(localStream.getTracks()[1]);
                    localVideo.srcObject=localStream;
                }
            })
        }

        // function to add tracks to the peer connection for p2p 
        function addtracks(peer){
            localStream.getTracks().forEach(track=>{
                senders.push(peer.addTrack(track,localStream));
            });
            return;
        }
        
        callButton.addEventListener('click', callAction);
        shareButton.addEventListener('click', shareAction);
        

        // trace function
        function trace(text) {
            text = text.trim();
            const now = (window.performance.now() / 1000).toFixed(3);

            console.log(now, text);
        }
        // triggers whenever websockets receives a message
        function websocketrecievemessage(event){
            
            let data=JSON.parse(event.data);
            var user=data['user'];
            var action=data['action'];
            if(action=="new-message"){
                document.querySelector('#chat-log').value += (" "+user+ ":" + data['message'] + '\n');
                return;
            }
            // to ignore all the meesages coming from self
            if(user==username)
                return;
            // to get the channel_name from where message has arrived
            var receiver_channel=data['message']['receiver_channel_name'];
    
            if(action=="new-peer")
            {
                //new user who has joined
                createOfferer(user,receiver_channel);
                return;
            }

            if(action=='new-offer'){
                console.log("got new offer from",user);
                // to extract offer from other peer
                var offer= data['message']['sdp'];
                createAnswerer(offer,user,receiver_channel);
                return;
            }

            if(action=='new-answer'){
                console.log("answer from",user);
                // to extract answer from the other peer
                var answer=data['message']['sdp'];
                var peer=clients[user][0];
                console.log('clients:');
                for(key in clients){
                    console.log(key, ': ', clients[key]);
                }

                peer.setRemoteDescription(answer);
                return; 
            }
    
        }