import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber, Connection } from 'openvidu-browser';
import { throwError as observableThrowError, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ChangeService } from '../services/chat.service';
import { messages } from '../shared/message.model';
import { stringify } from 'querystring';
import { ServerService } from '../services/server.service';
import { CommonVarService } from '../services/common-var.service';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {

  // OPENVIDU_SERVER_URL = 'https://' + '192.168.99.100' + ':4443';
  // OPENVIDU_SERVER_SECRET = 'MY_SECRET';
  videoSubscription: Subscription;
  audioSubscription: Subscription;

  
  src = "../../assets/images/video.png"
  src2 = "../../assets/images/mic.png"

  // OpenVidu objects



  OV: OpenVidu;
  session: Session;
  publisher: any; // Local
  subscribers: StreamManager[] = []; // Remotes
  connection: Connection[] = [];
  show = false;
  Host = false;
  // Join form
  mySessionId: string;
  myUserName: string;
  tk: any;
  startSpeaking = false;
  connectionId: any;
  audioconnectionId: any;
  subaudio: any;
  token:any
  
  pub = true
  exp: any;
  local=false;
  // Main video of the page, will be 'publisher' or one of the 'subscribers',
  // updated by click event in UserVideoComponent children
  mainStreamManager: StreamManager;
  audioOn = true;
  videoOn = true;
  messages: messages[];
  messageSubscription: Subscription

  constructor(private httpClient: HttpClient, private Router: ActivatedRoute, private chatService: ChangeService, private Route: Router,private ServerService:ServerService,private commeonservice:CommonVarService) {
    this.generateParticipantInfo();
  }
  ngOnInit() {
    this.local=true
    this.Router.params
      .subscribe((params: Params) => {
        if (params.session) {
          this.Host = true;
          this.mySessionId = params.session
          this.token=this.ServerService.getsettoken()

          this.joinSession()
        }
       
        if (params.id) {
          this.mySessionId = params.id;

        }
        if(localStorage.getItem('token'))
        {
          this.myUserName = localStorage.getItem('name')
        }
        else{
        this.commeonservice.loginopen()

        }
        this.commeonservice.loginIdentification.subscribe((event)=>
        {
          this.myUserName = localStorage.getItem('name')
          this.local = false
        })


      }
      )

    this.messageSubscription = this.chatService.messageChanged
      .subscribe((messages) => {
        this.messages = messages
        console.log(messages)
      })
  }

  @HostListener('window:beforeunload')
  beforeunloadHandler() {
    // On window closed leave session
    this.leaveSession();
  }

  ngOnDestroy() {
    // On component destroyed leave session
    this.leaveSession();
  }
  getToken()
  { if(localStorage.getItem('token'))
  {
    this.ServerService.gettoken(this.mySessionId)
    .subscribe((response:any)=>
    {
       this.token = response.token
       
       if(response.role=="MODERATOR")
       {
         this.Host=true
       }
        
       this.joinSession()
        
    },
    error=>
    {
      alert(error.error.error)
    })
  }
  else{
    this.commeonservice.loginopen()
  }
  }

  joinSession() {

    // --- 1) Get an OpenVidu object ---

    this.OV = new OpenVidu();

    // --- 2) Init a session ---

    this.session = this.OV.initSession();

    this.session.on('reconnecting', () => alert('Oops! Trying to reconnect to the session'));
    this.session.on('reconnected', () => alert('Hurray! You successfully reconnected to the session'));
    this.session.on('sessionDisconnected', (event: any) => {
      if (event.reason === 'networkDisconnect') {
        alert('Dang-it... You lost your connection to the session');
      } else {
        // Disconnected from the session for other reason than a network drop
      }
    });
    // --- 3) Specify the actions when events take place in the session ---

    // On every new Stream received...
    this.session.on('streamCreated', (event: StreamEvent) => {

      // Subscribe to the Stream to receive it. Second parameter is undefined
      // so OpenVidu doesn't create an HTML video by its own
      let subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);
      this.connection.push(subscriber.stream.connection);
    });

    // On every Stream destroyed...
    this.session.on('streamDestroyed', (event: StreamEvent) => {

      // Remove the stream from 'subscribers' array
      this.deleteSubscriber(event.stream.streamManager);
    });


    this.session.on('signal:chat', (data: any) => {
      const clientData = JSON.parse(data.from.data)
      const messages: messages = { 'name': clientData.clientData, 'message': data.data }
      this.chatService.addmessage(messages)


    });
    this.session.on('signal:audio', (data: any) => {
      this.subaudio = JSON.parse(data.data)
      this.audioconnectionId = data.from.connectionId
    });
    this.session.on('signal:video', (data: any) => {
      console.log(data)
    });
    this.session.on('signal:stopRemoteAudio', (data: any) => {
      const message = data.data.split(',')
      if (message[1] == this.publisher.stream.connection.connectionId) {
        this.audioOn = true;
        this.audiochange()
      }
      if (this.myUserName != message[0]) {
        alert(message[2] + ' muted ' + message[0])
      }
      else {
        alert(message[2] + ' muted You')

      }

    })
    this.session.on('signal:stopRemoteVideo', (data: any) => {
      const message = data.data.split(',')
      if (message[1] == this.publisher.stream.connection.connectionId) {
        this.videoOn = true;
        this.videochange()
      }
      if (this.myUserName != message[0]) {
        alert(message[2] + ' unpublish ' + message[0])
      }
      else {
        alert(message[2] + ' unpublish You')

      }
    })


    // --- 4) Connect to the session with a valid user token ---

    // 'getToken' method is simulating what your server-side should do.
    // 'token' parameter should be retrieved and returned by your own backend
    

      // First param is the token got from OpenVidu Server. Second param can be retrieved by every user on event
      // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
      this.session.connect(this.token, { clientData: this.myUserName })
        .then(() => {

          // --- 5) Get your own camera stream ---

          // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
          // element: we will manage it on our own) and with the desired properties
          let publisher: Publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true,     // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true,     // Whether you want to start publishing with your video enabled or not
            resolution: '640x480',  // The resolution of your video
            frameRate: 30,          // The frame rate of your video
            insertMode: 'APPEND',   // How the video is inserted in the target element 'video-container'
            mirror: true           // Whether to mirror your local video or not
          });

          // --- 6) Publish your stream ---

          this.session.publish(publisher);

          // Set the main video in the page to display our webcam and store our Publisher
          this.mainStreamManager = publisher;
          this.publisher = publisher;
        })
        .catch(error => {
          console.log('There was an error connecting to the session:', error.code, error.message);
          console.log("1");
        });
   

    this.session.on('publisherStartSpeaking', (event: any) => {
      this.startSpeaking = true;
      this.connectionId = event.connection.connectionId;


    });

    this.session.on('publisherStopSpeaking', (event: any) => {
      this.startSpeaking = false;

    });
  }

  leaveSession() {

    // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

    if (this.session) { this.session.disconnect(); };

    // Empty all properties...
    this.subscribers = [];
    delete this.publisher;
    delete this.session;
    delete this.OV;
    this.generateParticipantInfo();
    this.Route.navigate([''])
  }


  private generateParticipantInfo() {
    // Random user nickname and sessionId

    this.myUserName = 'Participant' + Math.floor(Math.random() * 100);
  }

  private deleteSubscriber(streamManager: StreamManager): void {
    let index = this.subscribers.indexOf(streamManager, 0);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  updateMainStreamManager(streamManager: any) {
    this.mainStreamManager = streamManager;
  }

  disconnect(streamManager: StreamManager) {
    this.session.forceDisconnect(streamManager.stream.connection);

  }




  /**
   * --------------------------
   * SERVER-SIDE RESPONSIBILITY
   * --------------------------
   * This method retrieve the mandatory user token from OpenVidu Server,
   * in this case making use Angular http API.
   * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION. In this case:
   *   1) Initialize a session in OpenVidu Server	 (POST /api/sessions)
   *   2) Generate a token in OpenVidu Server		   (POST /api/tokens)
   *   3) The token must be consumed in Session.connect() method of OpenVidu Browser
   */

  

  

  

  onSubmit(f: NgForm) {
    const data = f.value.chat
    const mess: any = { "data": data, "to": this.connection, "type": "chat" }
    const messages: messages = { "name": this.myUserName, "message": f.value.chat }
    this.session.signal(mess)
    this.chatService.addmessage(messages)
    f.reset()
  }

  chat() {
    this.show = !this.show;

  }
  audiochange() {
    this.audioOn = !this.audioOn
    this.publisher.publishAudio(this.audioOn);

    const mess: any = { "data": String(this.audioOn), "to": this.connection, "type": "audio" }
    this.session.signal(mess)
    if (this.audioOn) {
      this.src2 = "../../assets/images/mic.png"

    }
    else {
      this.src2 = "../../assets/images/mic-off.png"
    }

  }
  videochange() {
    this.videoOn = !this.videoOn
    this.publisher.publishVideo(this.videoOn);
    const mess: any = { "data": String(this.videoOn), "to": this.connection, "type": "video" }
    this.session.signal(mess)
    if (this.videoOn) {
      this.src = "../../assets/images/video.png"

    }
    else {
      this.src = "../../assets/images/video-off.png"

    }

  }
  subaudiooff(sub: any) {
    const message: string = "" + (JSON.parse(sub.stream.connection.data)).clientData + ',' + sub.stream.connection.connectionId + ',' + this.myUserName + ""
    console.log(message)
    const mess: any = { "data": message, "to": this.connection, "type": "stopRemoteAudio" }
    this.session.signal(mess)

  }
  subvideooff(sub: any) {

    const message: string = "" + (JSON.parse(sub.stream.connection.data)).clientData + ',' + sub.stream.connection.connectionId + ',' + this.myUserName + ""
    console.log(message)
    const mess: any = { "data": message, "to": this.connection, "type": "stopRemoteVideo" }
    this.session.signal(mess)

  }



}
