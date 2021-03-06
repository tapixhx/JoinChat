import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber, Connection } from 'openvidu-browser';
import { throwError as observableThrowError, Subscription } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ChangeService } from '../services/chat.service';
import { messages } from '../shared/message.model';
import { ServerService } from '../services/server.service';
import { CommonVarService } from '../services/common-var.service';
import Swal from 'sweetalert2';
import { AppComponent } from '../app.component';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {

  // OPENVIDU_SERVER_URL = 'https://' + '192.168.99.100' + ':4443';
  // OPENVIDU_SERVER_SECRET = 'MY_SECRET';
  @ViewChild('scroll',{static:false}) scroll: ElementRef;
  videoSubscription: Subscription;
  audioSubscription: Subscription;
  ngAfterViewChecked() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight
  }

  src = "../../assets/images/video.png"
  src2 = "../../assets/images/mic.png"

  // OpenVidu objects



  OV: OpenVidu;
  session: Session;
  publisher: any; // Local
  subscribers: StreamManager[] = []; // Remotes
  connection: Connection[] = [];
  audioconnectionId: any[] = [];
  videoconnectionId: any[] = [];
  show = false;
  Host = false;
  mySessionId: string;
  myUserName: string;
  screenshareOn=false;
  tk: any;
  hovered=false;
  startSpeaking:any[] = [];
  connectionId: any;
  subaudio: any;
  subvideo:any;
  ename:any;
  enter=false;
  exitname:any;
  exit=false;
  share=false;
  color=["#F1C40F","#212F3C","#F4D03F","#1F618D","#212F3C","#F4D03F","#2E86C1","#F8C471","#1F618D"] 
  token: any;
  seconds=0;

  pub = true
  exp: any;
  local = false;
  countMessages=0;
  // Main video of the page, will be 'publisher' or one of the 'subscribers',
  // updated by click event in UserVideoComponent children
  mainStreamManager: StreamManager;
  audioOn = true;
  videoOn = true;
  messages: messages[];
  messageSubscription: Subscription

  constructor(private httpClient: HttpClient, 
              private Router: ActivatedRoute, 
              private chatService: ChangeService, 
              private Route: Router, 
              private ServerService: ServerService, 
              private commeonservice: CommonVarService,
              private appcomponent: AppComponent) {

  }
  ngOnInit() {
    this.local = true
    this.Router.params
      .subscribe((params: Params) => {
        if (params.session) {
          this.Host = true;
          this.mySessionId = params.session
          this.token = this.ServerService.getsettoken()
          this.myUserName = localStorage.getItem('name')
          this.joinSession()
        }

        if (params.id) {
          this.mySessionId = params.id;

        }
        if (localStorage.getItem('token')) {
          this.myUserName = localStorage.getItem('name')
        }
        else {
          this.commeonservice.loginopen()
        }
        this.commeonservice.loginIdentification.subscribe((event) => {
          this.myUserName = localStorage.getItem('name')
          this.local = false
        })
      }
      )

    this.messageSubscription = this.chatService.messageChanged
      .subscribe((messages) => {
        this.messages = messages
        this.countMessages=this.countMessages+1;
        if(this.show)
        {
          this.countMessages=0
        }
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
  getToken(c: NgForm) {
    this.appcomponent.load=true;
    if (localStorage.getItem('token')) {
      this.ServerService.gettoken(this.mySessionId)
        .subscribe((response: any) => {
          this.token = response.token;
          this.myUserName = c.value.userName
          // console.log(response);
          if (response.role == "MODERATOR") {
            this.Host = true
          }
          this.appcomponent.load=false;
          this.joinSession()

        },
          error => {
            if(error.error.error == "jwt expired")
            {
                this.commeonservice.loginopen();
            }
            else if(error.error.error == "LogIn or SignUp again and try again!") {
              Swal.fire(
                'Oops!',
                'Signup again!',
                'error'
              )
            }
            else
            {
            Swal.fire(
              'Oops!',
              error.error.error,
              'error'
            )
            this.appcomponent.load=false;
            }
          })
        
    }
    else {
      this.commeonservice.loginopen()
    }
  }

  joinSession() {

    

    this.OV = new OpenVidu();

    this.OV.setAdvancedConfiguration(
      { screenShareChromeExtension: "https://chrome.google.com/webstore/detail/EXTENSION_NAME/EXTENSION_ID" }
    );

    // --- 2) Init a session ---

    this.session = this.OV.initSession();

    this.commeonservice.logoutfasle()

    this.session.on('reconnecting', () => Swal.fire(
      'Oops!',
      'Oops! Trying to reconnect to the session',
      'error'
    ));
    this.session.on('reconnected', () => Swal.fire(
      'Success',
      'Hurray! You successfully reconnected to the session',
      'success'
    ));
    this.session.on('sessionDisconnected', (event: any) => {
      if (event.reason === 'networkDisconnect') {
        Swal.fire(
          'Oops!',
          'Dang-it... You lost your connection to the session',
          'error'
        );
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
      const mess: any = { "data": String(this.audioOn), "to": subscriber.stream.connection, "type": "audio" }
      this.session.signal(mess);
      const messs: any = { "data": String(this.videoOn), "to":subscriber.stream.connection, "type": "video" }
      this.session.signal(messs)
      // console.log(this.getNicknameTag(event));
      this.enter=true;
      this.ename=this.getNicknameTag(event)+' joined';
      let guest = setInterval(()=>{
        this.seconds=this.seconds+1;
        if(this.seconds==2) {
          this.enter=false;
          this.seconds=0;
          clearInterval(guest);
        }
      },1000);
    });

    // On every Stream destroyed...
    this.session.on('streamDestroyed', (event: any) => {
      // Remove the stream from 'subscribers' array
      this.deleteSubscriber(event.stream.streamManager);
      this.connection.splice(this.connection.indexOf(event.stream.connection), 1) //remove connectionId from array
      // console.log(this.getNicknameTag(event));
      this.exit=true;
      this.exitname=this.getNicknameTag(event)+' left';
      let guest = setInterval(()=>{
        this.seconds=this.seconds+1;
        if(this.seconds==2) {
          this.exit=false;
          this.seconds=0;
          clearInterval(guest);
        }
      },1000);
    });


    this.session.on('signal:chat', (data: any) => {
      const clientData = JSON.parse(data.from.data)
      const messages: messages = { 'name': clientData.clientData, 'message': data.data }
      this.chatService.addmessage(messages)
    });

    this.session.on('signal:audio', (data: any) => {
      this.subaudio = JSON.parse(data.data)
      if (!this.subaudio) {
        this.audioconnectionId.push(data.from.connectionId)
      }
      else {
        this.audioconnectionId.splice(this.audioconnectionId.indexOf(data.from.connectionId), 1)
      }
    });

    this.session.on('signal:video', (data: any) => {
      this.subvideo = JSON.parse(data.data)
      if (!this.subvideo) {
        this.videoconnectionId.push(data.from.connectionId)
      }
      else {
        this.videoconnectionId.splice(this.videoconnectionId.indexOf(data.from.connectionId), 1)
      }
    });

    this.session.on('signal:stopRemoteAudio', (data: any) => {
      const message = data.data.split(',')
      if (message[1] == this.publisher.stream.connection.connectionId) {
        this.audioOn = true;
        this.audiochange()
      }
      if (this.myUserName != message[0]) {
        Swal.fire({
          title: message[2] + ' muted ' + message[0],
          timer: 1500,
        })
      }
      else {
        Swal.fire({
          title: message[2] + ' muted You',
          timer: 1500,
        })

      }

    })
    
    this.session.on('signal:stopRemoteVideo', (data: any) => {
      const message = data.data.split(',')
      if (message[1] == this.publisher.stream.connection.connectionId) {
        this.videoOn = true;
        this.videochange()
      }
      if (this.myUserName != message[0]) {
        Swal.fire({
          title: message[2] + ' unpublish ' + message[0],
          timer: 1500
        })
      }
      else {
        Swal.fire({
          title: message[2] + ' unpublish You',
          timer: 1500,
        })

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
          mirror: false        // Whether to mirror your local video or not
        });

        // --- 6) Publish your stream ---

        this.session.publish(publisher);

        // Set the main video in the page to display our webcam and store our Publisher
        this.mainStreamManager = publisher;
        this.publisher = publisher;
      })
      .catch(error => {
        // console.log('There was an error connecting to the session:', error.code, error.message);
      });


    this.session.on('publisherStartSpeaking', (event: any) => {
      
      this.connectionId = event.connection.connectionId;
      let connectionIndex = this.connection.indexOf(event.connection)
      this.updateMainStreamManager(this.subscribers[connectionIndex])
      this.startSpeaking.push(event.connection.connectionId)
});

    this.session.on('publisherStopSpeaking', (event: any) => {
   
      this.startSpeaking.splice(this.startSpeaking.indexOf(event.connection.connectionId),1)
   
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
    this.commeonservice.logoutTrue()
    this.Route.navigate([''])
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
    this.countMessages=0;
  }
  nochat()
  {
    this.show =false
  }

  shareScreen() {
    this.session.unpublish(this.publisher);
    let publisher: Publisher = this.OV.initPublisher(undefined, {
      audioSource: undefined, // The source of audio. If undefined default microphone
      videoSource: 'screen', // The source of video. If undefined default webcam
      publishAudio: true,     // Whether you want to start publishing with your audio unmuted or not
      publishVideo: true,     // Whether you want to start publishing with your video enabled or not
      resolution: '640x480',  // The resolution of your video
      frameRate: 30,          // The frame rate of your video
      insertMode: 'APPEND',   // How the video is inserted in the target element 'video-container'
      mirror: false          // Whether to mirror your local video or not
    });
    this.publisher=publisher;
    this.session.publish(publisher);
    this.updateMainStreamManager(publisher);
    this.screenshareOn=!this.screenshareOn;
    this.share=!this.share;
  }

  stopShare() {
    this.session.unpublish(this.publisher);
    let publisher: Publisher = this.OV.initPublisher(undefined, {
      audioSource: undefined, // The source of audio. If undefined default microphone
      videoSource: undefined, // The source of video. If undefined default webcam
      publishAudio: true,     // Whether you want to start publishing with your audio unmuted or not
      publishVideo: true,     // Whether you want to start publishing with your video enabled or not
      resolution: '640x480',  // The resolution of your video
      frameRate: 30,          // The frame rate of your video
      insertMode: 'APPEND',   // How the video is inserted in the target element 'video-container'
      mirror: false           // Whether to mirror your local video or not
    });
    this.publisher=publisher;
    this.session.publish(publisher);
    this.updateMainStreamManager(publisher);
    this.screenshareOn=!this.screenshareOn;
    this.share=!this.share;
    this.src = "../../assets/images/video.png";
    this.videoOn=true;
    const mess: any = { "data": String(this.videoOn), "to": this.connection, "type": "video" }
    this.session.signal(mess);
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
    // console.log(message);
    const mess: any = { "data": message, "to": this.connection, "type": "stopRemoteAudio" }
    this.session.signal(mess)
  }

  subvideooff(sub: any) {
    const message: string = "" + (JSON.parse(sub.stream.connection.data)).clientData + ',' + sub.stream.connection.connectionId + ',' + this.myUserName + ""
    // console.log(message);
    const mess: any = { "data": message, "to": this.connection, "type": "stopRemoteVideo" }
    this.session.signal(mess)
  }

  getNicknameTag(sub: any) {
    return JSON.parse(sub.stream.connection.data).clientData;
  }

  checksubaudiooff(sub: any) {
    return this.audioconnectionId.includes(sub.stream.connection.connectionId)
  }

  checkspecking(sub:any) {
    return this.startSpeaking.includes(sub.stream.connection.connectionId)
  }
  chatClose()
  {
    this.show=false
  }
  checkVideo(sub:any)
  {
    return this.videoconnectionId.includes(sub.stream.connection.connectionId)
  }
  getFirstLetter(sub:any)
  { let FirstName=this.getNicknameTag(sub)
    FirstName=FirstName.split("")
     return FirstName[0]
  }
  Myfirstletter()
  {
    let FirstName:any=this.myUserName;
    FirstName=FirstName.split("")
     return FirstName[0]
  }

    getRandomColor(i:any) {
      
      return this.color[i%10]
    }
  
}
