import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatDetails } from './../../../models/chatDetails';
import { ChatService } from '../../../shared/services/chat.service';
import { NgbModal, NgbActiveModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { NgxCarousel } from 'ngx-carousel';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

import { Subject } from 'rxjs/Subject';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    providers: [ChatService, NgbActiveModal, NgbModal]
})
export class ChatComponent implements OnInit {
    messages = []; // message array
    message: any;
    showDiv: any; // hide and show chat view
    successCode: any;
    chat: any; // chat data from response
    configData: any; // inital configration data for login api
    loginResponsce: any; // get responsce data from login
    wsUri: any;
    imgags: string[];
    socket: WebSocket;
    conversation_id: any;
    customer: any;
    user: any;
    base64textString: String = "";

    activeRooms: any = [];
    reg: any = {};
    showLogin: any = null;

    public carouselTileTwoItems: Array<any> = [];
    public carouselTileTwo: NgxCarousel;

    public carouselQuickRepliesItems: Array<any> = [];
    public carouselQuickReplies: NgxCarousel;
    quickRepliesItems: any = [];

    param = {
        channel: "ChatChannel"
    };

    closeResult: string; // modal close Result
    modalReference: any; // modal Reference

    ngbModalOptions: NgbModalOptions = { backdrop: 'static', keyboard: true }; // modal options to avoid outside click


    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    @ViewChild('registrationModal')
    private registrationModalTemplate: ElementRef;

    ChatForm = new FormGroup({
        message: new FormControl('', Validators.required)
    });


    constructor(
        private chatService: ChatService,
        public activeModal: NgbActiveModal,
        private modalService: NgbModal) { }

    fetchConfigData() { // fetch initial data
        this.chatService.fetchConfigData().subscribe(successCode => {
            this.configData = {};
            this.configData = successCode;
            if (this.user == null) {
                this.removeMappingModalTemp();
            }
        },
            errorCode => {
                this.successCode = errorCode
                this.messages.push({ 'msgre': false, 'message': 'admin', 'action': false });
            });
    }

    removeMappingModalTemp() { // warining modal message before delete mapping link
        this.modalReference = this.modalService.open(this.registrationModalTemplate, this.ngbModalOptions);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }


    login(email) { // login to banking
        this.messages.push({ 'msgre': email, 'message': 'user', 'action': false });
        this.chatService.login(email).subscribe(successCode => {
            this.loginResponsce = successCode;
            this.modalReference.close();
            // Web socket URI for login
            this.wsUri = `${this.loginResponsce.url}?access_token=${this.loginResponsce.access_token}`;
            this.activeRooms = [];
            this.message = null;
            this.user = this.loginResponsce;
            this.loginResponsce.rooms.map(roomOnline => {
                if (String(roomOnline.id) === this.configData.room_id) {
                    this.activeRooms.push(roomOnline);
                }
            })
            // if there is no active room... you cannot chat.
            if (this.activeRooms.length != 0) {
                this.connectServer(this.wsUri);
            }
        },
            errorCode => {
                this.successCode = errorCode
                this.messages.push({ 'msgre': false, 'message': 'admin', 'action': false });
            });
    }
    createNewUser(reg) {
      reg.username =  reg.email
      this.chatService.createNewUser(reg).subscribe(successCode => {
          this.modalReference.close();
          this.login(reg.email);
      },
          errorCode => {
              this.successCode = errorCode
              this.messages.push({ 'msgre': false, 'message': 'admin', 'action': false });
          });
    }

    connectServer(wsUri) {
        this.socket = new WebSocket(wsUri);
        this.socket.addEventListener('open', (e) => {
            const subMsg = {
                command: "subscribe",
                identifier: JSON.stringify(this.param)
            }
            this.socket.send(JSON.stringify(subMsg));
        });

        this.socket.addEventListener('message', (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'confirm_subscription') {
                console.log(msg);
                const join_msg = {
                    command: "message",
                    identifier: JSON.stringify(this.param),
                    data: JSON.stringify({ action: 'join_room', room_id: this.configData.room_id })
                };
                this.socket.send(JSON.stringify(join_msg));
            }

            if (msg.message && msg.message.conversation_id) {
                const sentBy = msg.message.sent_by.toLowerCase();
                if (msg.message.end_customer) {
                    this.customer = msg.message.end_customer;
                }
                this.conversation_id = msg.message.conversation_id;

                if (sentBy === "me") {

                } else if (sentBy === "-") {

                } else if (sentBy === "system") {

                    if (msg.message.messages == undefined) {
                        this.messages.push({ 'msgre': msg.message.body, 'message': 'admin', 'action': false });
                    } else if (msg.message.messages.length != 0) {
                        for (const msgs of msg.message.messages) {
                            if (msgs.sent_by == this.loginResponsce.name) {
                                this.messages.push({ 'msgre': msgs.body, 'message': 'user', 'action': false });
                            } else {
                                const message = JSON.parse(msgs.body);
                                if (message.text) {
                                    this.messages.push({ 'msgre': message.text, 'message': 'admin', 'action': false, 'quickReplies': false, 'list': false, 'imageList': false });
                                }
                            }
                        }
                    }

                } else {

                    const message = JSON.parse(msg.message.body);
                    if (message.text) {
                        this.messages.push({ 'msgre': message.text, 'message': 'admin', 'action': false, 'quickReplies': false, 'list': false, 'imageList': false });
                    }
                    if (message.quick_replies) {
                        this.messages.push({ 'msgre': message.quick_replies, 'message': 'admin', 'action': true, 'quickReplies': true, 'list': false, 'imageList': false });
                        this.carouselQuickRepliesItems = [];
                        this.carouselQuickRepliesItems = message.quick_replies;
                    }

                    if (message.attachment) {
                        this.messages.push({ 'msgre': message.attachment.payload.elements, 'message': 'admin', 'action': true, 'quickReplies': false, 'list': false, 'imageList': true });
                        this.carouselTileTwoItems = [];
                        this.carouselTileTwoItems = message.attachment.payload.elements;
                    }
                }
            }
        });

    }

    toggleChat(showDiv) { // chat window hide and show
        this.showDiv = !showDiv;
    }

    ngOnInit() { // init
        this.showDiv = true;
        this.carouselTileTwo = {
            grid: { xs: 1, sm: 3, md: 4, lg: 6, all: 230 },
            speed: 600,
            interval: 3000,
            point: {
                visible: false
            },
            load: 1,
            touch: true
        };
        this.imgags = [
            'assets/bg.jpg',
            'assets/car.png',
            'assets/canberra.jpg',
            'assets/holi.jpg'
        ];
        this.fetchConfigData();
    }

    public carouselTileTwoLoad(data) {
    }

    sendMessage(mes) { // sendMessage
        if (mes != "" && mes != null) {
            this.message = null;
            this.messages.push(({ 'msgre': mes, 'message': 'user', 'action': false }));
            // Now send the message throught the backend API
            const msgObj = {
                command: "message",
                identifier: JSON.stringify(this.param),
                data: JSON.stringify({ action: 'post_message', conversation_id: this.conversation_id, body: mes })
            };

            if (this.configData.room_id) {
                this.socket.send(JSON.stringify(msgObj));
            } else {
                const response = 'Connecting with Agent...';
                this.messages.push({ 'msgre': response, 'message': 'admin', 'action': false });
            }
        }
    }

    sendMessageQR(quickReplies) { // sendMessage
        if (quickReplies != "" && quickReplies != null) {
            this.message = null;
            this.messages.push(({ 'msgre': quickReplies.title, 'message': 'user', 'action': false }));
            // Now send the message throught the backend API
            const msgObj = {
                command: "message",
                identifier: JSON.stringify(this.param),
                data: JSON.stringify({ action: 'post_message', conversation_id: this.conversation_id, body: quickReplies.payload })
            };

            if (this.configData.room_id) {
                this.socket.send(JSON.stringify(msgObj));
            } else {
                const response = 'Connecting with Agent...';
                this.messages.push({ 'msgre': response, 'message': 'admin', 'action': false });
            }
        }
    }


    fileuploaderFileChange(event, modalimportNameChange) {   // file Upload
        let file: File = null;
        let fileList: FileList = null;
        fileList = event.target.files;
        if (fileList.length > 0) {
            file = fileList[0];
            const reader = new FileReader();
            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsBinaryString(file);
        }
    }

    _handleReaderLoaded(readerEvt) {
        const binaryString = readerEvt.target.result;
        this.base64textString = btoa(binaryString);
        this.chatService.sendFile(this.base64textString, this.conversation_id, this.loginResponsce.access_token).subscribe(
            success => { },
            error => {
                if (error) { }
            }
        );
    }

    getDismissReason(reason: any): string { // close modal reason
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }
}
