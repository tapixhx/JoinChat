import { Component, Input } from '@angular/core';
import { StreamManager } from 'openvidu-browser';

@Component({
    selector: 'user-video',
    styles: [`
        ov-video {
            width: auto;
            height: 100% !important;
            cursor: pointer;
        }
        .name {
            
            background: rgb(11,12,16,0.5);
            padding-left: 5px;
            padding-right: 5px;
            color: #66fcf1;
            font-weight: bold;
            border-bottom-right-radius: 4px;
        }
        p {
            margin: 0;
            background-color: rgb(11,12,16,0.5) !important;
            color: #66fcf1 !important;
        }`],
    template: `
        <div>
        <div class="name"><p>{{getNicknameTag()}}</p></div>
        <ov-video [streamManager]="streamManager"></ov-video>
        </div>`
})
export class UserVideoComponent {

    @Input()
    streamManager: StreamManager;

    getNicknameTag() { // Gets the nickName of the user
        return JSON.parse(this.streamManager.stream.connection.data).clientData;
    }
}
