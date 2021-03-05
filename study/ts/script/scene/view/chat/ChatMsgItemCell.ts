const {ccclass, property} = cc._decorator;

import { ChatConst } from '../../../const/ChatConst';
import { SignalConst } from '../../../const/SignalConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { RichTextHelper } from '../../../utils/RichTextHelper';
import UIHelper from '../../../utils/UIHelper';
import { GroupsViewHelper } from '../groups/GroupsViewHelper';

@ccclass
export default class ChatMsgItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textServerName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageChannel: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBgRichText: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRichText: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _spriteTitle: cc.Node = null;

    @property({
        type:cc.Label,
        visible:true
    })
    _textVoiceLen:cc.Label = null;

    @property(cc.Sprite)
    imageVoice:cc.Sprite = null;

    @property(cc.Prefab)
    ChatTimeTipLayer:cc.Prefab = null;

    
    _isLeft: boolean;
    _isVoice: any;
    _chatMsg: any;
    _needShowTime: any;
    _listWidth: any;
    _extraHeight: number;
    _isEvent: any;
    _signalVoicePlayNotice: any;
    _viewTimeNode: any;
    _moveX: number;
    _moveY: number;
    _delayStamp: any;
    _listener: any;
    timeHeight:number = 0;
    richNode:cc.RichText;

    
    private _needRepair:boolean = false;
    ctor(param) {
        var chatMsgData = param[0];
        var listWidth = param[1];
        this._isLeft = !chatMsgData.getSender().isSelf();
        this._isVoice = chatMsgData.isVoice();
        this._chatMsg = chatMsgData;
        this._needShowTime = this._chatMsg.getNeedShowTimeLabel();
        this._listWidth = listWidth;
        this._extraHeight = 0;
        this._isEvent = chatMsgData.isEvent();
        this._needRepair = false;
        this._updateUI();
    }
    onCreate() {
        UIHelper.addClickEventListenerEx(this._imageBgRichText.node, handler(this, this._onScrollViewTouchCallBack));
    }
    onEnable() {
        this._signalVoicePlayNotice = G_SignalManager.add(SignalConst.EVENT_VOICE_PLAY_NOTICE, handler(this, this._onEventVoicePlayNotice));
        this._clearVoiceEffect();
        this._initUI();
        
    }
    onInit(){
    }
    _clearVoiceEffect() {
        if (!this._isVoice) {
            return;
        }
        this.imageVoice.node.removeAllChildren();
    }
    onExit() {
        this._signalVoicePlayNotice.remove();
        this._signalVoicePlayNotice = null;
    }
    _onEventVoicePlayNotice(event, chatMsg, isPlay) {
        if (!this._isVoice) {
            return;
        }
        if (isPlay && chatMsg && chatMsg.voiceEquil(this._chatMsg)) {
            this._clearVoiceEffect();
            G_EffectGfxMgr.createPlayGfx(this.imageVoice.node, 'effect_yuyin');
        }
        if (!isPlay && chatMsg && chatMsg.voiceEquil(this._chatMsg)) {
            this._clearVoiceEffect();
        }
    }
    
    _initUI(){
        this._commonHeroIcon.setTouchEnabled(true);
        this._commonHeroIcon.setCallBack(handler(this, this.onClickHeroHead));
    }
    onClickHeroHead(sender) {
        var chatPlayerData = this._chatMsg.getSender();
        if (!chatPlayerData.isSelf()) {
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_SHOW_PLAYER_DETAIL, chatPlayerData);
        } else {
            //dump(chatPlayerData);
        }
    }
    getTotalHeight() {
        var viewSize = this._resourceNode.getContentSize();
        var viewTimeHeight = this._viewTimeNode == null && 0 || this._viewTimeNode.getContentSize().height;
        return viewSize.height + viewTimeHeight + this._extraHeight;

    }
    _updateUI() {
        var viewSize = this._resourceNode.getContentSize();
        var officialLevel = this._chatMsg.getSender().getOffice_level();
        var playerInfo = this._chatMsg.getSender().getPlayer_info();
        var baseId = this._chatMsg.getSender().getPlayer_info().covertId;
        var senderTitle = this._chatMsg.getSender().getTitles();
        var nameColor = Colors.getOfficialColor(officialLevel);
        var channel = this._chatMsg.getChannel();
        UIHelper.loadTextureFromAtlas(this._imageChannel, Path.getChatFaceMiniRes(ChatConst.CHANNEL_PNGS[channel-1]));
        this._imageChannel.node.active = (true);
        this._textPlayerName.string = (this._chatMsg.getSender().getName());
        this._textPlayerName.node.color = (nameColor);
        UIHelper.updateLabelSize(this._textPlayerName);
        UIHelper.updateTextOfficialOutline(this._textPlayerName.node, officialLevel);
        if (this._spriteTitle != null) {
            //dump(senderTitle);
            if (senderTitle && senderTitle > 0) {
                this._spriteTitle.setAnchorPoint(1,0.5);
                UserDataHelper.appendNodeTitle(this._spriteTitle, senderTitle, 'ChatMsgItemCell',this._spriteTitle.getAnchorPoint());
                this._spriteTitle.active = (true);
            } else {
                this._spriteTitle.active = (false);
            }
        }
        if (channel == ChatConst.CHANNEL_PRIVATE) {
            var chatPlayerData = this._chatMsg.getSender();
            var chatTargetId = chatPlayerData.getId();
            if (chatPlayerData.isSelf()) {
                UIHelper.loadTextureFromAtlas(this._imageChannel, Path.getChatFaceMiniRes('img_voice_ziji'));
                this._imageChannel.node.active = (false);
                var targetPox = this._textPlayerName.node.x + this._imageChannel.node.getContentSize().width;
                this._textPlayerName.node.x = (targetPox);
                if (this._spriteTitle != null) {
                    var titilePosX = this._textPlayerName.node.x - (this._textPlayerName.node.getContentSize().width + ChatConst.CHAT_TITLE_OFFSET);
                    this._spriteTitle.x = (titilePosX)+60;
                }
            } else {
                var isFriend = G_UserData.getFriend().isUserIdInFriendList(chatTargetId);
                if (isFriend) {
                    UIHelper.loadTextureFromAtlas(this._imageChannel, Path.getChatFaceMiniRes('img_voice_haoyou'));
                } else {
                    UIHelper.loadTextureFromAtlas(this._imageChannel, Path.getChatFaceMiniRes('img_voice_moshengren'));
                }
                if (this._spriteTitle != null) {
                    var titilePosX = this._textPlayerName.node.x + (this._textPlayerName.node.getContentSize().width + ChatConst.CHAT_TITLE_OFFSET);
                    this._spriteTitle.x = (titilePosX)+60;
                }
            }
        } else {
            if (this._spriteTitle != null) {
                var chatPlayerData = this._chatMsg.getSender();
                if (chatPlayerData.isSelf()) {
                    var titilePosX = this._textPlayerName.node.x - (this._textPlayerName.node.getContentSize().width + ChatConst.CHAT_TITLE_OFFSET);
                    this._spriteTitle.x = (titilePosX)+60;
                } else {
                    var titilePosX = this._textPlayerName.node.x + (this._textPlayerName.node.getContentSize().width + ChatConst.CHAT_TITLE_OFFSET);
                    this._spriteTitle.x = (titilePosX)+60;
                }
            }
        }
        this._commonHeroIcon.updateIcon(playerInfo, null, this._chatMsg.getSender().getHead_frame_id());
        if (this._isLeft) {
            this._resourceNode.setAnchorPoint(0, 0);
            this._resourceNode.x = (0);
        } else {
            this._resourceNode.setAnchorPoint(1, 0);
            this._resourceNode.x = (this._listWidth);
        }
        var timeNode = this._resourceNode.getChildByName("_viewTimeNode");
        if(timeNode)
        this._resourceNode.removeChild(timeNode,true);
        this._viewTimeNode = null;
        var timeHeight = 0;
        if (this._needShowTime) {
            this._viewTimeNode = this._createTimeTipNode(G_ServerTime.getTimeString(this._chatMsg.getTime()));
            if (this._isLeft){
                this._viewTimeNode.setPosition(viewSize.width * 0.5, viewSize.height);
            }else{
                this._viewTimeNode.setPosition(-viewSize.width * 0.5, viewSize.height);
            }
            this._resourceNode.addChild(this._viewTimeNode);
            this._viewTimeNode.name = "_viewTimeNode";
            timeHeight = this._viewTimeNode.height;
        }
        this._showTxt(this._chatMsg.getContent(), this._chatMsg.getMsg_type());
        if (this._isVoice) {
            // var voiceInfo = this._chatMsg.getVoiceInfo();
            // this._textVoiceLen.string = (Lang.get('chat_voice_time', { value: voiceInfo.voiceLen }));
        }
        this.timeHeight = timeHeight;
        if(timeHeight > 0){
            this.node.height = this.node.height + timeHeight;
        }
    }
    _createTimeTipNode(text) {
        var viewTimeNode = cc.instantiate(this.ChatTimeTipLayer);
        var textTime = UIHelper.seekNodeByName(viewTimeNode, 'Text_Time').getComponent(cc.Label);
        textTime.string = (text);
        viewTimeNode.setAnchorPoint(0.5, 0);
        return viewTimeNode;
    }
    _showTxt(chatContent, type) {
        var richElementList = RichTextHelper.parse2RichMsgArr({
            strInput: chatContent,
            textColor: '#'+Colors.CHAT_MSG.toHEX('#rrggbb'),
            fontSize: 20,
            msgType: type
        });
        var richStr = JSON.stringify(richElementList);
        var label = RichTextExtend.createWithContent(richStr);
        var biaoqingHeight = 0;
        if(richStr.indexOf("filePath")>=0)
        {
            biaoqingHeight = 10;
        }
        label.lineHeight = 20 + biaoqingHeight;
        label.maxWidth = 310;
        label.node.setAnchorPoint(cc.v2(0.5, 0.5));

        this._panelRichText.removeAllChildren();
        this._panelRichText.addChild(label.node);
        var virtualContentSize = label.node.getContentSize();
        
        if(this._needRepair)
        {
            //未知bug
            //添加保护
            var contentA = JSON.parse(richStr);
            var repairW = 0;
            for(var k in  contentA)
            {
                repairW = repairW + contentA[k].width;
            }
            if(repairW>310)repairW = 310;
            label.node.setContentSize(repairW,virtualContentSize.height)
            this._needRepair = false;
            virtualContentSize.width = repairW;
        }


        var richTextWidth = virtualContentSize.width;
        var richtextHeight = virtualContentSize.height;
        
        
        var totalHeight = 0;
        let offset = 0;
        for(var i=0;i<label.node.childrenCount;i++){
            var child = label.node.children[i];
            totalHeight = Math.max(totalHeight, child.height-child.y + 8);
        }
        var topHeight = 34;
        this._imageBgRichText.node.setContentSize(richTextWidth+40, richtextHeight+24);
        this._extraHeight = richtextHeight - this._panelRichText.height;
        // this._panelRichText.setContentSize(richTextWidth, richtextHeight);
        this.node.height = topHeight + this._imageBgRichText.node.height;
        this.richNode = label;

        (this._panelRichText.getComponent(cc.Widget) as cc.Widget).updateAlignment();
    }
    getChatMsg() {
        return this._chatMsg;
    }
    _onClickItem(sender,state) {
        var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (offsetX < 20 && offsetY < 20) {
            if (this._isVoice) {
                //G_VoiceManager.playRecordVoice(this._chatMsg);
            } else if (this._isEvent) {
                var sceneName = G_SceneManager.getRunningScene().getName();
                if (sceneName == 'fight') {
                    G_Prompt.showTip(Lang.get('chat_pk_hint_when_infight'));
                } else {
                    if (G_SceneManager.getRunningSceneName() == 'guildTrain' && !G_UserData.getGuild().getTrainEndState()) {
                        G_Prompt.showTipOnTop(Lang.get('guild_exit_tanin_forbid'));
                        return;
                    }
                    var teamType = parseInt(this._chatMsg.getParameter().getValue('teamType'));
                    var teamId = parseInt(this._chatMsg.getParameter().getValue('teamId'));
                    var isOk = GroupsViewHelper.checkIsCanApplyJoin(teamType), func;
                    if (isOk) {
                        G_UserData.getGroups().c2sApplyTeam(teamType, teamId);
                    } else {
                        if (func) {
                            func();
                        }
                    }
                }
            }
        }
    }
    _onLongPressCallBack(sender, state) {
        if (this._moveX < 20 && this._moveY < 20) {
            var point = cc.v2(sender.getTouchBeganPosition().x, sender.getTouchBeganPosition().y);
            var txt = this._chatMsg.getContent();
            var chatCopyNode = G_SceneManager.getRunningScene().getVoiceViewByName('ChatCopyNode');
            if (chatCopyNode) {
                chatCopyNode.destroy();
            }
            // var node = new ChatCopyNode(point, txt);
            // node.setName('ChatCopyNode');
            // G_SceneManager.getRunningScene().addChildToVoiceLayer(node);
        }
    }
    _onScrollViewTouchCallBack(event:cc.Event, data) {
        var sender = event.target;
        var state = event.type;
        if (event.type == cc.Node.EventType.TOUCH_START) {
            this._delayStamp = 1;//timer.getms();
            this._moveX = 0, this._moveY = 0;
            if (this._listener) {
                this.unschedule(this._listener);
            }
            this._listener = this.schedule(function () {
               // logWarn('ChatMsgItemCell long click------------------');
                if (this._delayStamp) {
                    this._delayStamp = null;
                    //logWarn('ChatMsgItemCell long click ok ------------------');
                    this._onLongPressCallBack(sender, state);
                }
            }.bind(this), 0.6);
        } else if (event.type == cc.Node.EventType.TOUCH_MOVE) {
            var offsetX = Math.abs(sender.getTouchMovePosition().x - sender.getTouchBeganPosition().x);
            var offsetY = Math.abs(sender.getTouchMovePosition().y - sender.getTouchBeganPosition().y);
            this._moveX = offsetX, this._moveY = offsetY;
        } else if (event.type == cc.Node.EventType.TOUCH_END || state == cc.Node.EventType.TOUCH_CANCEL) {
            if (state == cc.Node.EventType.TOUCH_END && this._delayStamp) {
                this._onClickItem(sender, state);
            }
            this._delayStamp = null;
        }
    }

    updateItemSize(){
        if(!this.richNode){
            // 
            return;
        }

        (this._panelRichText.getComponent(cc.Widget) as cc.Widget).updateAlignment();
        
        var virtualContentSize = this.richNode.node.getContentSize();
        var richTextWidth = virtualContentSize.width;
        var richtextHeight = virtualContentSize.height;
        if(richTextWidth<=1)
        {
            this.needRepair();
            return;
        }
        var topHeight = 34;
        this._imageBgRichText.node.setContentSize(richTextWidth+40, richtextHeight+24);
        this._extraHeight = richtextHeight - this._panelRichText.height;
        
        var right = (this._panelRichText.getComponent(cc.Widget) as cc.Widget).right;
        var left = (this._panelRichText.getComponent(cc.Widget) as cc.Widget).left;
        this._panelRichText.setAnchorPoint(0.5,0.5);
        if(right>10)
        {
            this._panelRichText.setContentSize(richTextWidth+40 - right, richtextHeight+24);
            this._panelRichText.x = -((richTextWidth+40 - right)/2 + right);
            this._panelRichText.y = -(richtextHeight+24)/2;
        }
        else if(left>10)
        {
            this._panelRichText.setContentSize(richTextWidth+40 - left, richtextHeight+24);
            this._panelRichText.x = (richTextWidth+40 - left)/2 +left;
            this._panelRichText.y = -(richtextHeight+24)/2;
        }

        
        this.node.height = topHeight + this._imageBgRichText.node.height + this.timeHeight + 10;
        var add = 0;
        if(this.richNode.node.width>=this.richNode.maxWidth)
        {
            add = this.richNode.lineHeight-10;
        }
        this._resourceNode.y = this.node.height - this.timeHeight - this._resourceNode.height - 10;
        this.richNode = null;
    }
    private needRepair():void{
        this._needRepair = true;

        this._updateUI();
        var virtualContentSize = this.richNode.node.getContentSize();
        var richTextWidth = virtualContentSize.width;
        var richtextHeight = virtualContentSize.height;

        var topHeight = 34;
        this._imageBgRichText.node.setContentSize(richTextWidth+40, richtextHeight+24);
        this._extraHeight = richtextHeight - this._panelRichText.height;

        var right = (this._panelRichText.getComponent(cc.Widget) as cc.Widget).right;
        var left = (this._panelRichText.getComponent(cc.Widget) as cc.Widget).left;
        this._panelRichText.setAnchorPoint(0.5,0.5);
        if(right>10)
        {
            this._panelRichText.setContentSize(richTextWidth+40 - right, richtextHeight+24);
            this._panelRichText.x = -((richTextWidth+40 - right)/2 + right);
            this._panelRichText.y = -(richtextHeight+24)/2;
        }
        else if(left>10)
        {
            this._panelRichText.setContentSize(richTextWidth+40 - left, richtextHeight+24);
            this._panelRichText.x = (richTextWidth+40 - left)/2 +left;
            this._panelRichText.y = -(richtextHeight+24)/2;
        }

        this.node.height = topHeight + this._imageBgRichText.node.height + this.timeHeight + 10;
        var add = 0;
        if(this.richNode.node.width>=this.richNode.maxWidth)
        {
            add = this.richNode.lineHeight-10;
        }
        this._resourceNode.y = this.node.height - this.timeHeight - this._resourceNode.height - 10;
        this.richNode = null;
    }

}
