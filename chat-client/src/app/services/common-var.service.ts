import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonVarService {
  loginchange= new Subject<boolean>();
  signupchange=new Subject<boolean>()
  loginIdentification = new Subject<boolean>();
  logoutchange = new Subject<boolean>();
  constructor() { }
  loginopen()
  {
    this.signupchange.next(false)
    this.loginchange.next(true)
  }
  signupopen()
  {
    this.loginchange.next(false)
    this.signupchange.next(true)
  }
  loginoff()
  {
    this.loginchange.next(false)
  }
  signupOff()
  {
    this.signupchange.next(false)
  }
  logined()
  {
     this.loginIdentification.next(true)
  }
  logoutfasle()
  {
    this.logoutchange.next(false)
  }
  logoutTrue()
  {
    this.logoutchange.next(true)
  }
  
  
}
