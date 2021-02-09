const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, Colors } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import UIHelper from '../../../utils/UIHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Path } from '../../../utils/Path';
import { ChatConst } from '../../../const/ChatConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { RichTextHelper } from '../../../utils/RichTextHelper';

@ccclass
export default class ChatPrivateMsgItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFriend: cc.Sprite = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeMsgBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSoundFlag: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMsg: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _commonButtonSmallNormal2: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _spriteTitle: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;


    static LEFT_SLIDE_DISTANCE = 99;
    static SLIDE_STATE_NONE = 0;
    static SLIDE_STATE_MOVE = 1;
    static SLIDE_STATE_SLIDE_TO_LEFT = 2;
    static SLIDE_STATE_SLIDE_TO_RIGHT = 3;
    static SLIDE_STATE_COMPLETE_SHOW_HIDE = 4;
    static RICH_TEXT_MAX_LENGTH = 9;

    _chatMsgData: any;
    _callback: any;
    _scrollState: number = 0;
    _signalRedPointUpdateChart: any;

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    onCreate() {
        this._imageSoundFlag.node.active = (false);
        //(this._imageArrow.node as any)._touchListener.setSwallowTouches(false);
        //this._commonButtonSmallNormal2.addTouchEventListener(handler(this, this._onClickDelete));
        //this._scrollView.setScrollBarEnabled(false);
        //this._scrollView.setSwallowTouches(false);
        //this._scrollView.setInertiaScrollEnabled(false);
        UIHelper.addEventListener(this.node, this._commonButtonSmallNormal2, 'ChatPrivateMsgItemCell', '_onClickDelete');
        UIHelper.addScrollViewEvent(this.node, this._scrollView, 'ChatPrivateMsgItemCell', '_onScrollViewEventCallBack');
        this._scrollView.content.on('touchstart', handler(this, this._onScrollViewTouchCallBack));
        this._scrollView.content.on('touchmove', handler(this, this._onScrollViewTouchCallBack));
        this._scrollView.content.on('touchend', handler(this, this._onScrollViewTouchCallBack));
        this._scrollView.content.on('touchcancel', handler(this, this._onScrollViewTouchCallBack));
    }
    onEnter() {
        this._signalRedPointUpdateChart = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._commonHeroIcon.setTouchEnabled(true);
        this._commonHeroIcon.setCallBack(handler(this, this.onClickHeroHead));
        // this._scrollView.horizontal = false;
        // this._scrollView.vertical = false;
    }
    onExit() {
        this._signalRedPointUpdateChart.remove();
        this._signalRedPointUpdateChart = null;
    }
    _onEventRedPointUpdate(event, funcId) {
        if (funcId == FunctionConst.FUNC_CHAT && this._chatMsgData) {
            this._refreshRedPoint();
        }
    }
    _refreshRedPoint() {
        var playerId = this._chatMsgData.getChatObject().getId();
        var showRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CHAT, 'personalChatRP', playerId);
        this._imageRedPoint.node.active = (showRedPoint);
    }
    onClickHeroHead(sender) {
        var chatPlayerData = this._chatMsgData.getChatObject();
        if (!chatPlayerData.isSelf()) {
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_SHOW_PLAYER_DETAIL, chatPlayerData);
        }
    }
    _onClickDelete(sender, state) {
        //if (UIHelper.isClick(sender, state)) {
        if (this._chatMsgData) {
            G_UserData.getChat().clearPrivateChatMsg(this._chatMsgData);
        }
        // }
    }
    _onClickItem(sender, state) {
        //logWarn('______________ChatPrivateMsgItemCell onClickItem');
        //if (UIHelper.isClick(sender, state)) {
        var curSelectedPos = this.getTag();
        this.dispatchCustomCallback(curSelectedPos);
        // }
    }
    _onScrollViewEventCallBack(sender, eventType) {
        //logWarn('....' + tostring(eventType));
        // if (eventType == ccui.ScrollviewEventType.scrollToLeft) {
        // } else if (eventType == ccui.ScrollviewEventType.scrollToRight) {
        // } else if (eventType == ccui.ScrollviewEventType.scrolling) {
        // } else if (eventType == ccui.ScrollviewEventType.containerMoved) {
        //     var x = this._scrollView.getInnerContainer().getPositionX();
        //     if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT) {
        //         if (x <= -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE + 5) {
        //             this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_COMPLETE_SHOW_HIDE;
        //         }
        //     } else if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT) {
        //         if (x >= -5) {
        //             this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_NONE;
        //         }
        //     }
        // } else if (eventType == ccui.ScrollviewEventType.autoscrollEnded) {
        //     this._performWithDelay(function () {
        //         if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT || this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT) {
        //             var x = this._scrollView.getInnerContainer().getPositionX();
        //             if (x <= -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE + 5) {
        //                 this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_COMPLETE_SHOW_HIDE;
        //             } else if (x >= -5) {
        //                 this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_NONE;
        //             } else {
        //             }
        //         }
        //     }, 0.01);
        // }
    }
    _onScrollViewTouchCallBack(event: cc.Event.EventTouch, customData) {
        //logWarn(state + ('..._onScrollViewTouchCallBack' + this._scrollState));
        var state = event.type;
        // if (state == 'touchend' || state == 'touchcancel') {
        //     if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_NONE) {
        //         var x = this._scrollView.content.x;
        //         if (x <= -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE * 0.2) {
        //             //logWarn('...scrollToRight');
        //             this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT;
        //             this._performWithDelay(function () {
        //                 this._scrollView.scrollToRight(0.5, true);
        //             }.bind(this), 0.01);
        //         } else if (x > -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE * 0.2 && x < 0) {
        //             //logWarn('...scrollToLeft');
        //             this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT;
        //             this._performWithDelay(function () {
        //                 this._scrollView.scrollToLeft(0.5, true);
        //             }.bind(this), 0.01);
        //         } else {
        //             this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_NONE;
        //         }
        //     }
        // }
        // if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_COMPLETE_SHOW_HIDE) {
        //     //logWarn('...scrollToLeft2');
        //     this._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT;
        //     this._performWithDelay(function () {
        //         (this._scrollView as cc.ScrollView).scrollToLeft(0.5, true);
        //     }.bind(this), 0.01);
        // }
        // if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT) {
        //     this._scrollView.scrollToRight(0.5, true);
        // } else if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT) {
        //     this._scrollView.scrollToLeft(0.5, true);
        // }
        if (this._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_NONE && state == 'touchend') {
            this._onClickItem(event.target, state);
        }
    }
    _performWithDelay(callback, delay) {
        var delay1 = cc.delayTime(delay);
        var sequence = cc.sequence(delay1, cc.callFunc(callback));
        this.node.runAction(sequence);
        return sequence;
    }
    _createMsgRichText(richStr) {
        var label = RichTextExtend.createWithContent(richStr);
        label.node.setAnchorPoint(cc.v2(0, 0.5));
        //label.setCascadeOpacityEnabled(true);
        //label.ignoreContentAdaptWithSize(true);
        //label.formatText();
        this._nodeMsg.removeAllChildren();
        this._nodeMsg.addChild(label.node);
        this.scheduleOnce(() => {
            var size = label.node.getContentSize();
            if (size.width > 0) {
                this._nodeMsgBg.node.active = (true);
                var bgSize = this._nodeMsgBg.node.getContentSize();
                var isVoice = this._chatMsgData.isVoice();
                this._nodeMsgBg.node.setContentSize(cc.size(size.width + (isVoice && 46 + 17 || 46), bgSize.height));
            } else {
                this._nodeMsgBg.node.active = (false);
            }
        }, 0)
    }
    updateInfo(chatMsgData) {
        this._chatMsgData = chatMsgData;
        var chatTarget = chatMsgData.getChatObject();
        var chatTargetId = chatMsgData.getChatObjectId();
        var name = chatTarget.getName();
        var baseId = chatTarget.getPlayer_info().covertId;
        var content = chatMsgData.getContent();
        var officialLevel = chatTarget.getOffice_level();
        var nameColor = Colors.getOfficialColor(officialLevel);
        var frameId = chatTarget.getHead_frame_id();
        //var isFriend = false;
        var isFriend = G_UserData.getFriend().isUserIdInFriendList(chatTargetId);
        if (isFriend) {
            UIHelper.loadTexture(this._imageFriend, Path.getTextSignet('img_voice_haoyou'));
        } else {
            UIHelper.loadTexture(this._imageFriend, Path.getTextSignet('img_voice_moshengren'));
        }
        this._commonHeroIcon.updateIcon(chatTarget.getPlayer_info(), null, frameId);
        this._textPlayerName.string = (name);
        this._textPlayerName.node.color = (nameColor);
        UIHelper.updateTextOfficialOutline(this._textPlayerName.node, officialLevel);
        var titile = G_UserData.getChat().getPrivateObjectTitles(chatTargetId);
        if (this._spriteTitle != null) {
            if (titile > 0) {
                var titilePosX = this._textPlayerName.node.x + this._textPlayerName.node.getContentSize().width + ChatConst.CHAT_TITLE_OFFSET;
                this._spriteTitle.x = (titilePosX);
                UserDataHelper.appendNodeTitle(this._spriteTitle, titile, this.node.name, this._spriteTitle.getAnchorPoint());
                this._spriteTitle.active = (true);
            } else {
                this._spriteTitle.active = (false);
            }
        }
        var isVoice = this._chatMsgData.isVoice();
        this._nodeMsg.x = (isVoice && this._imageSoundFlag.node.x + 21 || this._imageSoundFlag.node.x);
        this._imageSoundFlag.node.active = (isVoice);
        this._createMsgRichText(this._createRichStr(content));
        this._refreshRedPoint();
    }
    _createRichStr(content) {
        var param = {
            strInput: content,
            textColor: Colors.CHAT_MSG,
            fontSize: 22
        };
        var richElementList = RichTextHelper.parse2MiniRichMsgArr(param, ChatPrivateMsgItemCell.RICH_TEXT_MAX_LENGTH);
        var richStr = JSON.stringify(richElementList);
        return richStr;
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }

}
