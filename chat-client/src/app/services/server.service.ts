import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private rootUrl = "https://join-chat.herokuapp.com/"

  constructor(private http:HttpClient) { }

  login(data) {
    const headers = new HttpHeaders({'Content-Type':'application/json'})
    // console.log(JSON.stringify(data));
    return this.http.post(this.rootUrl+'user/login',JSON.stringify(data),
    {headers: headers});  
  }

  signup(data) {
    const headers = new HttpHeaders({'Content-Type':'application/json'})
    // console.log(JSON.stringify(data));
    return this.http.post(this.rootUrl+'user/signup',JSON.stringify(data),
    {headers: headers});  
  }

  verifyUser(otp:string, id:any) {
    const headers = new HttpHeaders({'Content-Type':'application/json'})
    return this.http.post(this.rootUrl+'user/otpVerify/'+id,
    JSON.stringify({otp}),
    {headers: headers});
  }

  resendOtp(id:any) {
    const headers = new HttpHeaders({'Content-Type':'application/json'})
    return this.http.get(this.rootUrl+'user/otpResend/'+id,
    {headers: headers});
  }

  getSessionId() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Authorization': `Bearer `+token,
    })
    return this.http.get(this.rootUrl+'user/getSession',
    {headers: headers});
  }

}
