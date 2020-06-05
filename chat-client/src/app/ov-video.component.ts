import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { StreamManager } from 'openvidu-browser';

@Component({
    selector: 'ov-video',
    styles: [`
    .height
    {
        height:33vh;
        text-align:center !important
    }
    @media only screen and (max-width: 992px) {
        .height
        {
            height:20vh
        }
       }
    @media only screen and (max-width: 455px) {
      .height
      {
          height:13vh
      }
     }
   
`],
    template: '<div class="height"><video style="height:100%;width:auto;" #videoElement></video><div>',
})
export class OpenViduVideoComponent implements AfterViewInit {

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
