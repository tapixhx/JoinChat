import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public rootUrl = "https://192.168.99.100:4443";

  constructor(private http: HttpClient) { }

  signUpUser() {
    const headers = new HttpHeaders({
      'Authorization': `Basic ` +btoa("OPENVIDUAPP:MY_SECRET"),
    })
    // console.log("Hello");
    return this.http.get(this.rootUrl,
    {headers: headers});
  }

  createSession(sessionId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ` +btoa("OPENVIDUAPP:MY_SECRET"),
    })
    return this.http.post(this.rootUrl + '/api/sessions',JSON.stringify({ customSessionId: sessionId }),
    {headers: headers});
  }

  createToken(sessionId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ` +btoa("OPENVIDUAPP:MY_SECRET"),
    })
    return this.http.post(this.rootUrl + '/api/tokens',JSON.stringify({ session: sessionId }),
    {headers: headers});
  }
}
