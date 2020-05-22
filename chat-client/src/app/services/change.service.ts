import { Subject } from 'rxjs';
export class ChangeService
{
 show :boolean;
 show2:boolean;
 videoChanged= new Subject<boolean>();
 audioChanged= new Subject<boolean>();

 changevideo(show:boolean)
 {
     this.show=!show;
     this.videoChanged.next(this.show)
     
 }
 changeaudio(show:boolean)
 {
     this.show2=!show;
     this.audioChanged.next(this.show)
 }

}