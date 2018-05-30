// Observable Version

import { Constants } from '../../constants/constant';
import { ChatDetails } from '../../models/chatDetails';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, Jsonp, RequestMethod, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

import { Subject } from 'rxjs/Subject';
import * as io from 'socket.io-client';


@Injectable()
export class ChatService {
    private socket;
    constructor(private http: Http) { }

    sendMessage(message: String): Observable<ChatDetails> {

        const cpHeaders = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: cpHeaders });
        const body = JSON.stringify({
            'message': message,
            'userId': '222222222222222'
        });
        return this.http.post(Constants.CHAT_SEND_MES, body, options)
            .map(success => <ChatDetails[]>success.json())
            .catch(this.handleError);
    }

    fetchConfigData() { // fetch initial configration
        return this.http.get('assets/config.json').map(
            (response) => response.json()
        )
    }
    fetchImageListData() {
      return this.http.get('assets/imagelist.json').map(
          (response) => response.json()
      )
    }

    login(email) {
        const cpHeaders = new Headers({
            'Content-Type': 'application/json'
        });
        const options = new RequestOptions({ headers: cpHeaders });

        const body = JSON.stringify({
            p_username: email
        });

        return this.http.post(Constants.CHAT_LOGIN, body, options)
            .map(success => <ChatDetails[]>success.json())
            .catch(this.handleError);
    }

    createNewUser(data) {
        const cpHeaders = new Headers({
            'Content-Type': 'application/json'
        });
        const options = new RequestOptions({ headers: cpHeaders });

        const body = JSON.stringify({
            username: data.username,
            email: data.email,
            password: data.password,
            name: data.name
        });

        return this.http.post(Constants.CHAT_REGISTRATION, body, options)
            .map(success => <ChatDetails[]>success.json())
            .catch(this.handleError);
    }

    getMessages(url) {
        const observable = new Observable(observer => {
            this.socket = io(url);
            this.socket.on('open', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        })
        return observable;
    }

    sendFile(file, conversationId, token) {
          const cpHeaders = new Headers({ 'Content-Type': 'application/json'});
          cpHeaders.append( 'Authorization', 'Bearer ' + token )
          const options = new RequestOptions();
          options.headers = cpHeaders;
          const body = {
              'body': 'file',
              'attached-file': 'data:image/png;base64,' + file
          }
          // const finalBody = JSON.stringify(JSON.parse(body)); // to remove / symbol
          return this.http.post('http://api.puristchat.com/admin/v1/conversations/' + conversationId + '/messages',  body, options)
              .map(success => success.json())
              .catch(this.handleError);
    }


    private extractData(res: Response) {
        const body = res.json();
        return body.data || {};
    }
    private handleError(error: Response | any) {
        return Observable.throw(error.status);
    }

}
