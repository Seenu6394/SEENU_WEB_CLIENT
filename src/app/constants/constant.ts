import { environment } from '../../environments/environment';
export class Constants {
    public static HOST = environment.server;
    public static CHAT_URL = environment.engine;

    // CHAT
    public static CHAT_SEND_MES = Constants.CHAT_URL + '/scs/callback';
    public static CHAT_LOGIN = Constants.HOST + '/s4mBotLogin';
    public static CHAT_REGISTRATION = Constants.HOST + '/s4mBotUserRegister';
    public static UPLOAD_FILE = 'http://user.puristchat.com/chat/upload';
  }
