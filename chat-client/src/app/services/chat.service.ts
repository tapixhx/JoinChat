import { Subject } from 'rxjs';
import { messages } from '../shared/message.model';
export class ChangeService
{
 
 messageChanged= new Subject<messages[]>();
 
 messages:messages[]=
 [
    
 ]
 addmessage(message:messages)
 {
     this.messages.push(message)
     this.messageChanged.next(this.messages)
     
 }
 getmessage()
 {
     return this.messages;
 }

}