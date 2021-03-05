import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { ConfigNameConst } from "../const/ConfigNameConst";

export class MailData extends BaseData {

    private _recvGetSimpleMail;
    private _recvAddSimpleMail;
    private _recvGetMail;
    private _recvProcessMail;
    private _recvProcessAllMail;
    private _recvDelMail;
    private _recvDelAllMail;
    private _recvMail;
    private _simpleMailList: { [key: number]: any };
    private _mailList: { [key: number]: any };
    private _lastMailId;

    private static GET_MAIL_CONTENT_MAX_NUM = 20;//一次性获取邮件最大数量

    constructor() {
        super()
        this._recvGetSimpleMail = G_NetworkManager.add(MessageIDConst.ID_S2C_SendSimpleMail, this._s2cSendSimpleMail.bind(this));
        this._recvAddSimpleMail = G_NetworkManager.add(MessageIDConst.ID_S2C_AddSimpleMail, this._s2cAddSimpleMail.bind(this));
        this._recvGetMail = G_NetworkManager.add(MessageIDConst.ID_S2C_GetMail, this._s2cGetMail.bind(this));
        this._recvProcessMail = G_NetworkManager.add(MessageIDConst.ID_S2C_ProcessMail, this._s2cProcessMail.bind(this));
        this._recvProcessAllMail = G_NetworkManager.add(MessageIDConst.ID_S2C_ProcessAllMail, this._s2cProcessAllMail.bind(this));
        this._recvDelMail = G_NetworkManager.add(MessageIDConst.ID_S2C_DelMail, this._s2cDelMail.bind(this));
        this._recvDelAllMail = G_NetworkManager.add(MessageIDConst.ID_S2C_DelAllMail, this._s2cDelAllMail.bind(this));
        this._recvMail = G_NetworkManager.add(MessageIDConst.ID_S2C_Mail, this._s2cMail.bind(this));
        this._simpleMailList = {};
        this._mailList = {};
    }

    public c2sGetMail(mailIdList) {
        var message = { ids: mailIdList };
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetMail, message);
    }

    public c2sProcessMail(mailId) {
        var message = { id: mailId };
        G_NetworkManager.send(MessageIDConst.ID_C2S_ProcessMail, message);
    }

    public c2sProcessAllMail(ids) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ProcessAllMail, { ids: ids });
    }

    public c2sDelMail(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_DelMail, { id: id });
    }

    public c2sDelAllMail(ids) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_DelAllMail, { ids: ids });
    }

    public c2sMail(uid, title, content) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_Mail, {
            uid: uid,
            title: title,
            content: content
        });
    }

    public clear() {
        this._recvGetSimpleMail.remove();
        this._recvGetSimpleMail = null;
        this._recvAddSimpleMail.remove();
        this._recvAddSimpleMail = null;
        this._recvGetMail.remove();
        this._recvGetMail = null;
        this._recvProcessMail.remove();
        this._recvProcessMail = null;
        this._recvProcessAllMail.remove();
        this._recvProcessAllMail = null;
        this._recvDelMail.remove();
        this._recvDelMail = null;
        this._recvDelAllMail.remove();
        this._recvDelAllMail = null;
        this._recvMail.remove();
        this._recvMail = null;
    }

    public reset() {
        this._simpleMailList = {};
        this._mailList = {};
    }

    private _s2cDelMail(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var mailId = message.id;
        this.removeMail(mailId);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIL_ON_REMOVE_MAIL, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
    }

    private _s2cDelAllMail(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var ids: any[] = message.ids || [];
        for (let i = 0; i < ids.length; i++) {
            var mailId = ids[i];
            this.removeMail(mailId);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_MAIL_ON_REMOVE_MAIL, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
    }

    private _s2cMail(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_MAIL_ON_SEND_MAIL, message);
    }

    private _s2cProcessMail(id, message) {
        if (message.ret != 1) {
            return;
        }
        var mailInfo = this.processMail(message.id);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIL_ON_PROCESS_MAIL, message, mailInfo);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
    }

    private _s2cProcessAllMail(id, message) {
        if (message.ret != 1) {
            G_SignalManager.dispatch(SignalConst.EVENT_MAIL_ON_PROCESS_ALL_MAIL, message);
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_MAIL_ON_PROCESS_ALL_MAIL, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
    }

    private _s2cSendSimpleMail(id, message) {
        var lastMailId = message.last_mail_id || 0;
        var mailList: any[] = message.mails || [];
        this._lastMailId = lastMailId;
        this._setSimpleMailList(mailList);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
    }

    private _s2cAddSimpleMail(id, message) {
        var mailList: any[] = message.mails || [];
        this._addSimpleMail(mailList);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
    }

    private _s2cGetMail(id, message) {
        if (message.ret == 1) {
            var mailList = message.mails || [];
            this._setMailList(mailList);
            G_SignalManager.dispatch(SignalConst.EVENT_MAIL_ON_GET_MAILS);
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
        }
    }

    private _dispatchMailNumChange() {
    }

    private _dispatchMailReadStateChange() {
    }

    public getMailData() {
        return this._simpleMailList;
    }

    public getMailDetailData() {
        return this._mailList;
    }

    private _setSimpleMailList(simpleMailList: any[]) {
        this._simpleMailList = {};
        for (let i = 0; i < simpleMailList.length; i++) {
            var mail: any = {};
            mail.id = simpleMailList[i].id;
            mail.mid = simpleMailList[i].mid;
            mail.isRead = simpleMailList[i].is_deal;
            mail.isOpen = false;
            this._simpleMailList[mail.id] = mail;
        }
    }

    public getMailIdList(): any[] {
        var needRequestData = false;
        var idList = [];
        for (const key in this._simpleMailList) {
            var sm = this._simpleMailList[key];
            if (sm && !this._mailList[key]) {
                idList.push(sm.id);
            }
        }

        idList.sort(function (mailId1, mailId2) {
            return mailId1 - mailId2;
        });
        var newList: any[] = [];
        for (let k = 0; k < idList.length; k++) {
            var v = idList[k];
            if (k < MailData.GET_MAIL_CONTENT_MAX_NUM) {
                newList.push(v);
            } else {
                break;
            }
        }
        if (newList.length > 0) {
            needRequestData = true;
        }
        return [
            needRequestData,
            newList
        ];
    }

    private _addSimpleMail(idList) {
        for (let i = 0; i < idList.length; i++) {
            var newMail: any = {};
            newMail.id = idList[i].id;
            newMail.mid = idList[i].mid;
            newMail.isRead = false;
            newMail.isOpen = false;
            this._simpleMailList[newMail.id] = newMail;
        }
    }

    private _setMailList(mailList) {
        for (let i = 0; i < mailList.length; i++) {
            var mail: any = {};
            mail.id = mailList[i].id;
            mail.mid = mailList[i].mid;
            mail.sender_id = mailList[i].sender_id;
            mail.time = mailList[i].time;
            mail.mail_contents = mailList[i].mail_contents;
            mail.mail_title = mailList[i].mail_title;
            mail.mail_name = mailList[i].mail_name;
            mail.awards = mailList[i].awards;
            mail.isRead = mailList[i].is_deal;
            mail.template = this._getMailTemplate(mail.mid);
            this._mailList[mail.id] = mail;
        }
    }

    public openAllMail() {
        for (const id in this._simpleMailList) {
            var sm = this._simpleMailList[id];
            if (sm != null) {
                sm.isOpen = true;
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED);
    }

    private _getMailTemplate(moduleId: number) {
        let MailInfo = G_ConfigLoader.getConfig(ConfigNameConst.MAIL);
        if (typeof (moduleId) == 'number' && moduleId > 0) {
            var mailInfo = MailInfo.get(moduleId);
            return mailInfo;
        }
        return null;
    }

    public processMail(id) {
        var mailInfo = this._mailList[id];
        if (mailInfo) {
            this._mailList[id].isRead = true;
            this._simpleMailList[id].isRead = true;
            var template = this._mailList[id].template;
        }
        return mailInfo;
    }

    public removeMail(id) {
        this._simpleMailList[id] = null;
        this._mailList[id] = null;
    }

    public hasNewAwardMail() {
        return true;
    }

    public hasUnReadMail() {
        function hasNewAward(simpleMail) {
            var template = this._getMailTemplate(simpleMail.mid);
            if (template) {
                return true;
            }
            return false;
        }
        for (const id in this._simpleMailList) {
            var sm = this._simpleMailList[id];
            if (!sm.isRead) {
                return true;
            }
        }
        return false;
    }

    public hasRedPoint() {
        for (const id in this._simpleMailList) {
            var sm = this._simpleMailList[id];
            if (sm && !sm.isOpen && !sm.isRead) {
                return true;
            }
        }
        return false;
    }

    public getEmailListByType(mailType): any[] {
        var emailList: any[] = [];
        var mailTypeList: any[] = [];
        for (const i in this._mailList) {
            var mail = this._mailList[i];
            if (mail) {
                var template = mail.template;
                if (template) {
                    mailTypeList.push(mail);
                }
            }
            else {
                let a = 1;
            }
        }
        var sortFunc = function (a, b) {
            return b.time - a.time;
        };
        mailTypeList.sort(sortFunc);
        for (const i in mailTypeList) {
            var mail = mailTypeList[i];
            emailList.push(mail);
        }
        return emailList;
    }

    public getMailById(id) {
        return this._mailList[id];
    }
}