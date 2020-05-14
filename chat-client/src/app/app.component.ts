import { Component, ViewChild } from '@angular/core';
import { throwError as observableThrowError } from 'rxjs';
import { ServerService } from 'src/app/services/server.service';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import {OpenviduSessionComponent, StreamEvent, Session, UserModel, OpenViduLayout, OvSettings, OpenViduLayoutOptions, SessionDisconnectedEvent, Publisher} from 'openvidu-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chat-client';

  // Join form
  mySessionId = 'SessionA';
  myUserName = 'Participant' + Math.floor(Math.random() * 100);
  tokens: string[] = [];
  session = false;
  // JOIN form

  ovSession: Session;
  ovLocalUsers: UserModel[];
  ovLayout: OpenViduLayout;
  ovLayoutOptions: OpenViduLayoutOptions;

  @ViewChild('ovSessionComponent')
  public ovSessionComponent: OpenviduSessionComponent;

  constructor(private serverservice: ServerService,
              private httpClient: HttpClient) {}

  async joinSession() {
    const token1 = await this.getToken();
    const token2 = await this.getToken();
    this.tokens.push(token1, token2);
    this.session = true;
  }


  // sessions
  handlerSessionCreatedEvent(session: Session): void {

    // You can see the session documentation here
    // https://docs.openvidu.io/en/stable/api/openvidu-browser/classes/session.html

    console.log('SESSION CREATED EVENT', session);

    session.on('streamCreated', (event: StreamEvent) => {
      // Do something
    });

    session.on('streamDestroyed', (event: StreamEvent) => {
      // Do something
    });

    session.on('sessionDisconnected', (event: SessionDisconnectedEvent) => {
      this.session = false;
      this.tokens = [];
    });

    this.myMethod();

  }
  // sessions

  handlerPublisherCreatedEvent(publisher: Publisher) {

    // You can see the publisher documentation here
    // https://docs.openvidu.io/en/stable/api/openvidu-browser/classes/publisher.html

    publisher.on('streamCreated', (e) => {
      console.log('Publisher streamCreated', e);
    });

  }

  handlerErrorEvent(event): void {
    // Do something
  }

  myMethod() {
    this.ovLocalUsers = this.ovSessionComponent.getLocalUsers();
    this.ovLayout = this.ovSessionComponent.getOpenviduLayout();
    this.ovLayoutOptions = this.ovSessionComponent.getOpenviduLayoutOptions();
  }

  // getToken returns session and token
  getToken(): Promise<string> {
    return this.createSession(this.mySessionId).then((sessionId) => {
      return this.createToken(sessionId);
    });
  }
  // myfunction   
  // createSession(sessionId) {
  //   return new Promise((resolve, reject) => {
  //     return this.serverservice.createSession(sessionId)
  //     .pipe(
  //       catchError((error) => {
  //         if (error.status === 409) {
  //           resolve(sessionId);
  //         } else {
  //           console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + this.serverservice.rootUrl);
  //           if (
  //             window.confirm(
  //               'No connection to OpenVidu Server. This may be a certificate error at "' +
  //                 this.serverservice.rootUrl +
  //                 '"\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server' +
  //                 'is up and running at "' +
  //                 this.serverservice.rootUrl +
  //                 '"',
  //             )
  //           ) {
  //             location.assign(this.serverservice.rootUrl + '/accept-certificate');
  //           }
  //         }
  //         return observableThrowError(error);
  //       }),
  //     )
  //     .subscribe(
  //       (response) => {
  //         console.log(response);
  //         resolve(response['id']);
  //       },
  //       (error) => {
  //         console.log(error);
  //       },
  //     )
  //   });
  // }

  // myfunction
  // createToken(sessionId) {
  //   return new Promise((resolve, reject) => {
  //     return this.serverservice.createToken(sessionId)
  //     .pipe(
  //       catchError((error) => {
  //         reject(error);
  //         return observableThrowError(error);
  //       }),
  //     )
  //     .subscribe(
  //       (response) => {
  //         console.log(response);
  //         resolve(response['token']);
  //       },
  //       (error) => {
  //         console.log(error);
  //       },
  //     )
  //   });
  // }

  // test() {
  //   this.serverservice.signUpUser()
  //   .subscribe(
  //     (response) => {
  //       console.log(response);
  //     },
  //     (error:HttpErrorResponse) => {
  //       console.log(error);
  //     },
  //   )
  // }

  createSession(sessionId) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({ customSessionId: sessionId });
      const options = {
        headers: new HttpHeaders({
          Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + 'MY_SECRET'),
          'Content-Type': 'application/json',
        }),
      };  
      return this.httpClient
        .post(this.serverservice.rootUrl + '/api/sessions', body, options)
        .pipe(
          catchError((error) => {
            if (error.status === 409) {
              resolve(sessionId);
            } else {
              console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + this.serverservice.rootUrl);
              if (
                window.confirm(
                  'No connection to OpenVidu Server. This may be a certificate error at "' +
                    this.serverservice.rootUrl +
                    '"\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server' +
                    'is up and running at "' +
                    this.serverservice.rootUrl +
                    '"',
                )
              ) {
                location.assign(this.serverservice.rootUrl + '/accept-certificate');
              }
            }
            return observableThrowError(error);
          }),
        )
        .subscribe((response) => {
          console.log(response);
          resolve(response['id']);
        });
    });
  }

  createToken(sessionId): Promise<string> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({ session: sessionId });
      const options = {
        headers: new HttpHeaders({
          Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + 'MY_SECRET'),
          'Content-Type': 'application/json',
        }),
      };
      return this.httpClient
        .post(this.serverservice.rootUrl + '/api/tokens', body, options)
        .pipe(
          catchError((error) => {
            reject(error);
            return observableThrowError(error);
          }),
        )
        .subscribe((response) => {
          console.log(response);
          resolve(response['token']);
        });
    });
  }
}