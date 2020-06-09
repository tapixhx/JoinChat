import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { StreamManager } from 'openvidu-browser';

@Component({
    selector: 'Main-video',
    styles: [`
     .adjust
     {
     text-align:center ;padding-top:4vh;height:100vh
     }
     video
     {
        width:auto;height:85%
     }
     @media only screen and (max-width: 992px) {
       .adjust
       {
           height:50vh
       }
      }
      @media only screen and (max-width: 455px) {
        .adjust
        {
            height:50vh;
            padding:0px 0px 0px;
        }
        video
        {
            height:100% 
        }
       }
      @media only screen and (max-width: 375px) {
          .adjust
          {
              height:45vh
          }
      }
      @media only screen and (max-width: 320px) {
        .adjust
        {
            height:38vh
        }
    }
    
`],
    template: '<div class="adjust"><video  #videoElement ></video><div>'
})
export class MainViduVideoComponent implements AfterViewInit {

    @ViewChild('videoElement') elementRef: ElementRef;

    _streamManager: StreamManager;

    ngAfterViewInit() {
        this._streamManager.addVideoElement(this.elementRef.nativeElement);
    }

    @Input()
    set streamManager(streamManager: StreamManager) {
        this._streamManager = streamManager;
        if (!!this.elementRef) {
            this._streamManager.addVideoElement(this.elementRef.nativeElement);
        }
    }

}
