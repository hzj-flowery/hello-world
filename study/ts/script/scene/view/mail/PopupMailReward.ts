import { MailConst } from "../../../const/MailConst";
import { MessageErrorConst } from "../../../const/MessageErrorConst";
import { SignalConst } from "../../../const/SignalConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_Prompt, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLargeHighlight from "../../../ui/component/CommonButtonLargeHighlight";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonButtonLevel0Normal from "../../../ui/component/CommonButtonLevel0Normal";
import CommonEmptyListNode from "../../../ui/component/CommonEmptyListNode";
import CommonFullScreenTitleNoBg from "../../../ui/component/CommonFullScreenTitleNoBg";
import CommonListViewLineItem from "../../../ui/component/CommonListViewLineItem";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import PopupBase from "../../../ui/PopupBase";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { handler } from "../../../utils/handler";
import { TextHelper } from "../../../utils/TextHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Util } from "../../../utils/Util";
import { MailHelper } from "./MailHelper";
import PopupMailRewardCell from "./PopupMailRewardCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupMailReward extends PopupBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;


    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView2: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMailDetail: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnTakeAll: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnDeleteReaded: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLargeHighlight,
        visible: true
    })
    _btnTake: CommonButtonLargeHighlight = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _commonEmptyNode: CommonEmptyListNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _emptyTips: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _emptyIcon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeExpiredTime: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFrom: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMailTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSendTime: cc.Label = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _commonItemList: CommonListViewLineItem = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAttachment: cc.Node = null;

    @property({
        type: CommonFullScreenTitleNoBg,
        visible: true
    })
    _commonTitle: CommonFullScreenTitleNoBg = null;

    _title: any;
    _callback: any;
    _selectIndex: any;
    _dataList: any[];
    _clickDeleteFlag: boolean;
    _selectMailInfo: any;
    _signalMailOnGetMailList: any;
    _signalMailOnProcessMail: any;
    _signalMailOnProcessAllMail: any;
    _signalMailOnRemoveMail: any;

    // preloadResList = [
    //     {path:("prefab/mail/PopupMailRewardCell")};

    // ]

    initData(title, callback) {
        this._title = title || Lang.get('mail_title_reward');
        this._callback = callback;
        this._selectIndex = null;
        this._dataList = [];
        this._clickDeleteFlag = false;
    }
    onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk.setTitle(this._title);
        this._commonTitle.setTitle(this._title);
        // var listView = this._listView;
        // listView.setTemplate(PopupMailRewardCell);
        // listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // listView.setCustomCallback(handler(this, this._onItemTouch));
        this._btnTakeAll.setString(Lang.get('mail_get_all_award'));
        this._btnDeleteReaded.setString(Lang.get('mail_btn_delete_readed'));
        this._btnTake.setString(Lang.get('common_btn_get_award'));
        this._commonEmptyNode.setTipsString(Lang.get('mail_empty_mail_tips'));
        this._emptyTips.string = (Lang.get('mail_text_no_tips_3'));

        var img: Array<string> = [];
        img.push("ui3/mail/img_mail01_down");
        img.push("ui3/mail/img_mail01_nml");
        img.push("ui3/mail/img_mailbg01");
        img.push("ui3/mail/img_mailbg02");
        cc.resources.load(img, cc.SpriteFrame, () => {
            cc.resources.load("prefab/mail/PopupMailRewardCell", cc.Prefab, handler(this, (error, res) => {
                this._updateListView();
            }));
        })
    }
    _sendGetMailInfo() {
        var [needRequestData, mailIdList] = G_UserData.getMails().getMailIdList();
        if (needRequestData) {
            G_UserData.getMails().c2sGetMail(mailIdList);
        }
        return needRequestData;
    }
    _selectItem(index) {
        // logWarn(tostring(this._selectIndex) + (' selectItem ' + tostring(index)));
        if (this._selectIndex == index) {
            return;
        }
        var mailInfo = this._dataList[index];
        if (mailInfo && !mailInfo.isRead) {
            var hasAttachment = mailInfo.awards && mailInfo.awards.length >= 1;
            if (!hasAttachment) {
                mailInfo.read = true;
                G_UserData.getMails().c2sProcessMail(mailInfo.id);
            }
        }
        var oldSelectItem = this._listView.content.children[this._selectIndex];
        if (oldSelectItem) {
            oldSelectItem.getComponent(PopupMailRewardCell).setSelected(false);
        }
        var item = this._listView.content.children[index];
        if (item) {
            item.getComponent(PopupMailRewardCell).setSelected(true);
        }
        this._selectIndex = index;
        this._selectMailInfo = mailInfo;
        var mailInfo = this._dataList[index];
        if (mailInfo) {
            this._updateMailDetailView(mailInfo);
        }
    }
    _onItemTouch(index, item) {
        this._selectItem(index);
    }
    _onItemUpdate(item, index) {
        var mailInfo = this._dataList[index + 1];
        if (mailInfo) {
            item.updateUI(mailInfo, index, this._selectIndex);
        }
    }
    _onItemSelected() {
    }
    handler1: any;
    onEnter() {
        this._signalMailOnGetMailList = G_SignalManager.add(SignalConst.EVENT_MAIL_ON_GET_MAILS, handler(this, this._onEventGetMailList));
        this._signalMailOnProcessMail = G_SignalManager.add(SignalConst.EVENT_MAIL_ON_PROCESS_MAIL, handler(this, this._onEventProcessMail));
        this._signalMailOnProcessAllMail = G_SignalManager.add(SignalConst.EVENT_MAIL_ON_PROCESS_ALL_MAIL, handler(this, this._onEventProcessAllMail));
        this._signalMailOnRemoveMail = G_SignalManager.add(SignalConst.EVENT_MAIL_ON_REMOVE_MAIL, handler(this, this._onEventMailOnRemoveMail));
        this.handler1 = handler(this, this._onUpdate)
        this.schedule(this.handler1, 2);
        this._onUpdate();
    }
    onExit() {
        this._signalMailOnGetMailList.remove();
        this._signalMailOnGetMailList = null;
        this._signalMailOnProcessMail.remove();
        this._signalMailOnProcessMail = null;
        this._signalMailOnProcessAllMail.remove();
        this._signalMailOnProcessAllMail = null;
        this._signalMailOnRemoveMail.remove();
        this._signalMailOnRemoveMail = null;
        this.unschedule(this.handler1);
    }
    _onUpdate() {
        this._sendGetMailInfo();
    }
    onShowFinish() {
        var needRequestData = this._sendGetMailInfo();
        if (!needRequestData) {
            // logWarn('PopupMailReward **************');
            this._updateListView();
        }
        G_UserData.getMails().openAllMail();
    }
    onBtnCancel() {
        this.close();
    }
    onBtnTakeAll(sender) {
        var ids = [];
        var hasExpiredMail = false;
        for (var i in this._dataList) {
            var value = this._dataList[i];
            var hasAttachment = value.awards && value.awards.length >= 1;
            var canReceive = hasAttachment && !value.isRead;
            var isExpired = UserDataHelper.isMailExpired(value);
            if (isExpired) {
                hasExpiredMail = true;
            }
            if (canReceive && !isExpired) {
                ids.push(value.id);
            }
        }
        if (ids.length <= 0) {
            if (hasExpiredMail) {
                this._updateListView();
                G_Prompt.showTip(Lang.get('mail_expired_tips'));
            } else {
                G_Prompt.showTip(Lang.get('mail_take_all_tips'));
            }
            return;
        }
        G_UserData.getMails().c2sProcessAllMail(ids);
    }
    onBtnDeleteReaded(sender) {
        var ids = [];
        var hasExpiredMail = false;
        for (var i in this._dataList) {
            var value = this._dataList[i];
            var isExpired = UserDataHelper.isMailExpired(value);
            if (isExpired) {
                hasExpiredMail = true;
            }
            if (value.isRead && !isExpired) {
                ids.push(value.id);
            }
        }
        if (ids.length <= 0) {
            if (hasExpiredMail) {
                this._updateListView();
                G_Prompt.showTip(Lang.get('mail_expired_tips'));
            } else {
                G_Prompt.showTip(Lang.get('mail_delete_readed_tips'));
            }
            return;
        }
        this._clickDeleteFlag = true;
        G_UserData.getMails().c2sDelAllMail(ids);
    }
    onBtnTake(sender) {
        var mailInfo = this._dataList[this._selectIndex];
        if (mailInfo) {
            var canReceive = mailInfo.awards && mailInfo.awards.length >= 1 && !mailInfo.isRead;
            var isExpired = UserDataHelper.isMailExpired(mailInfo);
            if (isExpired) {
                this._updateListView();
                G_Prompt.showTip(Lang.get('mail_expired_tips'));
                return;
            }
            if (canReceive) {
                G_UserData.getMails().c2sProcessMail(mailInfo.id);
            }
        }
    }
    _onEventProcessAllMail(id, message) {
        var takeMailList = function () {
            var idList = message['ids'] || [];
            if (idList.length > 0) {
                var awardList = this._getAwardList(idList);
                for (var i in idList) {
                    var id = idList[i];
                    G_UserData.getMails().processMail(id);
                }
                if (!(awardList.length == 1 && TypeConvertHelper.getTypeClass(awardList[0].type) == null)) {
                    PopupGetRewards.showRewards(awardList);
                }
                this._updateListView();
            }
        }.bind(this)
        if (message.ret != MessageErrorConst.RET_OK) {
            takeMailList();
            return;
        }
        takeMailList();
    }
    _onEventProcessMail(id, message, mailInfo) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (mailInfo) {
            var skipToNextCanReceiveMail = false;
            if (mailInfo.awards.length > 0) {
                G_Prompt.showAwards(mailInfo.awards);
                skipToNextCanReceiveMail = true;
            }
            this._updateListView(skipToNextCanReceiveMail);
        }
    }
    _onEventMailOnRemoveMail(event) {
        this._updateListView();
        if (this._clickDeleteFlag == true) {
            this._clickDeleteFlag = false;
            G_Prompt.showTip(Lang.get('mail_delete_success_tips'));
        }
    }
    _onEventGetMailList(id, message) {
        this._updateListView();
    }
    _findIndexById(data, dataList) {
        if (!data) {
            return null;
        }
        for (var k in dataList) {
            var v = dataList[k];
            if (data.id == v.id) {
                return parseInt(k) - 1;
            }
        }
        return null;
    }
    _updateListView(skipToNextCanReceiveMail?) {
        if (cc.resources.get("prefab/mail/PopupMailRewardCell") == null) {
            return;
        }
        var getNewIndex = function (newDataList, oldSelectMailInfo) {
            var defaultValue = newDataList.length - 1;
            if (newDataList.length <= 0) {
                defaultValue = null;
            }
            var oldSelectIndex = this._findIndexById(oldSelectMailInfo, newDataList);
            // logWarn('PopupMailReward  kkkkkkkkkkkkkkk ' + tostring(oldSelectIndex));
            var selectIndex = defaultValue;
            if (oldSelectIndex && oldSelectIndex >= 0) {
                selectIndex = oldSelectIndex;
            }
            return selectIndex;
        }.bind(this);
        var listView = this._listView;
        this._dataList = G_UserData.getMails().getEmailListByType(MailConst.MAIL_TYPE_AWARD);
        this._showEmptyView(this._dataList.length <= 0);
        var oldSelectIndex = this._selectIndex;
        var oldSelectMailInfo = this._selectMailInfo;
        var nextCanReceiveMailIndex = null;
        if (skipToNextCanReceiveMail) {
            nextCanReceiveMailIndex = this._getNextCanReceiveMailIndex(this._dataList, oldSelectMailInfo);
        }
        var selectIndex = nextCanReceiveMailIndex || getNewIndex(this._dataList, oldSelectMailInfo);
        selectIndex = 0;
        this._selectIndex = null;
        this._selectMailInfo = null;
        var isSameMail = function (mailLeft, mailRight) {
            if (mailLeft == null && mailRight == null) {
                return true;
            }
            if (mailLeft == null || mailRight == null) {
                return false;
            }
            return mailLeft.id == mailRight.id;
        };
        var lastMailToScreenDistance = 0;
        if (oldSelectIndex != undefined) {
            var scrollY = listView.content.y;
            // var mailLocation = listView.getItemBottomLocation(oldSelectIndex + 1);
            // lastMailToScreenDistance = mailLocation + scrollY;
        }
        var itemList = this._dataList;
        if (itemList) {
            this._listView.content.removeAllChildren();
            this._listView.content.height = 406;
            for (let i = 0; i < itemList.length; i++) {
                let cell = Util.getNode("prefab/mail/PopupMailRewardCell", PopupMailRewardCell) as PopupMailRewardCell;
                this._listView.content.addChild(cell.node);
                cell.updateUI(itemList[i], i, this._selectIndex);
                cell.setIdx(i);
                cell.setCustomCallback(handler(this, this._onItemTouch));
                cell.node.x = 0;
                cell.node.y = (i + 1) * -84;
                if (Math.abs(cell.node.y) > 406) {
                    this._listView.content.height = Math.abs(cell.node.y);
                }
            }
        }
        this._selectItem(selectIndex);
        if (selectIndex == undefined) {
            return selectIndex;
        }
        if (isSameMail(oldSelectMailInfo, this._selectMailInfo)) {
            // var mailLocation = listView.getItemBottomLocation(selectIndex + 1);
            // var posY = mailLocation - lastMailToScreenDistance;
            // listView.setLocationByPos(cc.v2(0, -posY));
        } else if (skipToNextCanReceiveMail) {
            // // logWarn('PopupMailReward   skipToNextCanReceiveMail');
            // if (!listView.isInVisibleRegion(selectIndex + 1)) {
            //     // logWarn('PopupMailReward   not isInVisibleRegion');
            //     listView.setLocation(selectIndex + 1, 318);
            // } else {
            //     // logWarn('PopupMailReward   isInVisibleRegion');
            // }
        } else {
            // logWarn('PopupMailReward   hahaha ');
            // listView.setLocation(selectIndex + 1);
        }
        // logWarn('PopupMailReward  ----------------------- ');
    }
    _showEmptyView(isShowEmpty) {
        this._listView.node.active = (!isShowEmpty);
        this._nodeMailDetail.active = (!isShowEmpty);
        this._commonEmptyNode.node.active = (isShowEmpty);
        this._emptyIcon.node.active = (isShowEmpty);
    }
    _updateMailDetailView(mailInfo) {
        var refreshRichFunc = function (richNode, richText) {
            richNode.removeAllChildren();
            var widget = RichTextExtend.createWithContent(richText);
            widget.node.setAnchorPoint(cc.v2(1, 0.5));
            richNode.addChild(widget.node);
        };
        var hasAttachment = mailInfo.awards && mailInfo.awards.length >= 1;
        var awardList = mailInfo.awards;
        var canReceive = hasAttachment && !mailInfo.isRead;
        var expiredTimeRichText = Lang.get('mail_expired_time_rich_text', { value: MailHelper.getMailExpiredTime(mailInfo) });
        var fromRichText = Lang.get('mail_from_who_rich_text', {
            value1: Lang.get('mail_from'),
            value2: TextHelper.convertKeyValuePairs(mailInfo.template.mail_name, mailInfo.mail_name)
        });
        refreshRichFunc(this._nodeExpiredTime, expiredTimeRichText);
        refreshRichFunc(this._nodeFrom, fromRichText);
        MailHelper.updateMailRichContent(mailInfo, this._textMailTitle, this._listView2.content);
        this._textSendTime.string = (MailHelper.getSendTimeString(mailInfo.time));
        this._nodeAttachment.active = (hasAttachment);
        this._commonItemList.setItemsMargin(18);
        this._commonItemList.updateUI(awardList);
        this._commonItemList.setIconMask(mailInfo.isRead);
        this._commonItemList.setMaxItemSize(3);
        this._commonItemList.setListViewSize(335, null);
        this._btnTake.setString(canReceive ? Lang.get('common_btn_get_award') : Lang.get('mail_delete_msg'));
        this._btnTake.setVisible(canReceive);
    }
    _getAwardList(mailIdList) {
        var retList = [];
        function procMailInfo(mailId) {
            var mailInfo = G_UserData.getMails().getMailById(mailId);
            if (mailInfo && mailInfo.awards.length > 0) {
                return mailInfo.awards;
            }
            return null;
        }
        var tempList = {};
        function merageAward(award) {
            var keyStr = award.type + ('|' + award.value);
            if (tempList[keyStr] == null) {
                tempList[keyStr] = award.size;
            } else {
                tempList[keyStr] = tempList[keyStr] + award.size;
            }
        }
        for (var i in mailIdList) {
            var mailId = mailIdList[i];
            var awards = procMailInfo(mailId);
            if (awards) {
                for (var i in awards) {
                    var value = awards[i];
                    merageAward(value);
                }
            }
        }
        for (var key in tempList) {
            var value = tempList[key];
            var array = key.split('|');
            var award = {
                type: parseInt(array[0]),
                value: parseInt(array[1]),
                size: value
            };
            retList.push(award);
        }
        return retList;
    }
    _getNextCanReceiveMailIndex(newDataList, oldSelectMailInfo) {
        if (!oldSelectMailInfo) {
            return null;
        }
        var nextIndex = null;
        var start = false;
        for (var i = 0; i <= newDataList.length - 1; i += 1) {
            var mailInfo = newDataList[i];
            var hasAttachment = mailInfo.awards && mailInfo.awards.length >= 1;
            var canReceive = hasAttachment && !mailInfo.isRead;
            if (start && canReceive) {
                nextIndex = i - 1;
                break;
            }
            if (mailInfo.id == oldSelectMailInfo.id) {
                start = true;
            }
        }
        return nextIndex;
    }
}