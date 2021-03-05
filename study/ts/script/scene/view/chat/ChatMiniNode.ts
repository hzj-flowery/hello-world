import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { ChatConst } from "../../../const/ChatConst";
import CommonVoiceButton from "../../../ui/component/CommonVoiceButton";
import { G_SignalManager, G_UserData, G_SceneManager, G_EffectGfxMgr } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { TextHelper } from "../../../utils/TextHelper";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import ChatMiniMsgScrollView from "./ChatMiniMsgScrollView";
import { RedPointHelper } from "../../../data/RedPointHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatMiniNode extends cc.Component {

    @property({
        type:cc.Node,
        visible:true
    })
    _resourceNode:cc.Node = null;

    @property({
        type:cc.Node,
        visible:true
    })
    _panelRoot:cc.Node = null;
    @property({
        type:cc.Node,
        visible:true
    })
    _panelPrivateChatHint:cc.Node = null;
    @property({
        type:cc.Node,
        visible:true
    })
    _buttonWorld:cc.Node = null;//CommonVoiceButton
    @property({
        type:cc.Node,
        visible:true
    })
    _buttonGuild:cc.Node = null;

    @property(cc.Prefab)
    ChatMiniMsgItemCell:cc.Prefab = null;

    @property({
        type:ChatMiniMsgScrollView,
        visible:true
    })
    _chatMsgScrollView: ChatMiniMsgScrollView = null;


    _msgGap: number;
    _scale: any;
    _signalChatGetMessage: any;
    _signalRedPointUpdateChart: any;
    _signalSystemMsgReceive: any;
    _signalUserLevelUpdate: any;
    _signalVoiceRecordChangeNotice: any;
    _signalUICloseChatMainView: any;
    _channelId: any;

    _isInit:boolean = false;

    onLoad() {
        this._msgGap = 4;
        var touchNode = new cc.Node();
        this._panelRoot.addChild(touchNode);
        touchNode.setContentSize(this._panelRoot.getContentSize());
        touchNode.setAnchorPoint(this._panelRoot.getAnchorPoint());
        UIHelper.addClickEventListenerEx(touchNode, handler(this, this._onClickMsgPanel));
        // UIHelper.addClickEventListenerEx(this._buttonWorld, handler(this, this._onClickWorldVoice));
        // UIHelper.addClickEventListenerEx(this._buttonGuild, handler(this, this._onClickGuildVoice));
        UIHelper.addClickEventListenerEx(this._panelPrivateChatHint, handler(this, this._onClickUnReadHint));
        //var ChatObject = require('ChatObject');
        // var worldchatObject = new ChatObject();
        // worldchatObject.setChannel(ChatConst.CHANNEL_WORLD);
        // var guildChatObject = new ChatObject();
        // guildChatObject.setChannel(ChatConst.CHANNEL_GUILD);
        // this._buttonWorld.updateInfo(worldchatObject, handler(this, this._onRecordVoiceTouchListener));
        // this._buttonGuild.updateInfo(guildChatObject, handler(this, this._onRecordVoiceTouchListener));
        //this._buttonWorld.showChatVoiceViewInCentre();
        //this._buttonGuild.showChatVoiceViewInCentre();
        this._scale = this._buttonWorld.scaleX;
        this._buttonGuild.active = false;
        this._buttonWorld.active = false;
        this._onCreate();
    }
    onEnable(){
        // if (!this._isInit || !this.isRunInBackgroud) {
        //     this.onEnter();
        // }
    }
    onDisable() {
        // if (!this.isRunInBackgroud) {
        //     this.onExit();
        // }
    }

    onDestroy() {
        this.onExit();
    }

    _onCreate() {
        this.onEnter();
    }
    onEnter() {
        if(!this._isInit){
            this._createScrollView();
            this._createEffectNode(this._panelPrivateChatHint);
            this._isInit = true;
        }
        
        //恢复
        this._resourceNode.active = true;

        this._signalChatGetMessage = G_SignalManager.add(SignalConst.EVENT_CHAT_GET_MESSAGE, handler(this, this._onEventGetMsg));
        this._signalRedPointUpdateChart = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSystemMsgReceive = G_SignalManager.add(SignalConst.EVENT_SYSTEM_MSG_RECEIVE, handler(this, this._onEventSystemMsgReceive));
        this._signalUserLevelUpdate = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventUserLevelUpdate));
        this._signalVoiceRecordChangeNotice = G_SignalManager.add(SignalConst.EVENT_VOICE_RECORD_CHANGE_NOTICE, handler(this, this._onEventVoiceRecordChangeNotice));
        this._signalUICloseChatMainView = G_SignalManager.add(SignalConst.EVENT_CHAT_UI_CLOSE_CHAT_MAIN_VIEW, handler(this, this._onEventUICloseChatMainView));
        this._refreshOpenState();
        this._refreshRedPoint();
        this._refreshScrollView();
    }
    onExit() {
        this._signalChatGetMessage.remove();
        this._signalChatGetMessage = null;
        this._signalRedPointUpdateChart.remove();
        this._signalRedPointUpdateChart = null;
        this._signalSystemMsgReceive.remove();
        this._signalSystemMsgReceive = null;
        this._signalUserLevelUpdate.remove();
        this._signalUserLevelUpdate = null;
        this._signalVoiceRecordChangeNotice.remove();
        this._signalVoiceRecordChangeNotice = null;
        this._signalUICloseChatMainView.remove();
        this._signalUICloseChatMainView = null;
    }
    _onEventGetMsg(event, chatUnit) {
        if (!G_UserData.getChat().getChatSetting().isShowMiniMsgOfChannel(chatUnit.getChannel())) {
            return;
        }
        if (chatUnit.getChannel() == ChatConst.CHANNEL_PRIVATE) {
            return;
        }
        this._chatMsgScrollView.addNewMsg(chatUnit);
    }
    _onEventSystemMsgReceive(event, systemMsg) {
        this._chatMsgScrollView.addNewMsg(systemMsg);
    }
    _onEventRedPointUpdate(event, funcId) {
        if (funcId == FunctionConst.FUNC_CHAT || funcId == FunctionConst.FUNC_MAIL) {
            this._refreshRedPoint();
        }
    }
    _onEventUserLevelUpdate(event, param) {
        this._refreshOpenState();
    }
    _refreshOpenState() {
        var isOpen = G_UserData.getChat().isFuncOpen();
        this.node.active = (isOpen);
        var [isFunctionOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_ARMY_GROUP);
        //this._buttonGuild.active = (isFunctionOpen);
    }
    _createScrollView() {
        // var ChatMiniMsgItemCell = require('ChatMiniMsgItemCell');
        var msgContainerSize = this._panelRoot.getContentSize();
        var msgList = [];
        //var node = new cc.Node();
        //this._chatMsgScrollView = node.addComponent(ChatMiniMsgScrollView);
        this._chatMsgScrollView.ctor(this, msgContainerSize, this._channelId, ChatConst.MAX_MINI_MSG_CACHE_NUM, msgList, this.ChatMiniMsgItemCell, this._msgGap);
        //this._chatMsgScrollView.node.active = (true);
        //this._panelRoot.addChild(this._chatMsgScrollView.node);
    }
    _refreshScrollView() {
        var msgList = G_UserData.getChat().getMiniMsgList();
        this._chatMsgScrollView.refreshData(msgList);
    }
    _refreshRedPoint() {
        var showRedPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CHAT);
        this._panelPrivateChatHint.active = (showRedPoint);
    }
    _createEffectNode(effectRootNode) {
        function effectFunction(effect:string):cc.Node {
            if (TextHelper.stringStartsWith(effect, 'effect_')) {
                var node = new cc.Node();
                var subEffect = node.addComponent(EffectGfxNode);//new EffectGfxNode(effect);
                subEffect.setEffectName(effect);
                subEffect.play();
                return subEffect.node;
            } else {
                return new cc.Node();
            }
        }
        var node = G_EffectGfxMgr.createPlayMovingGfx(effectRootNode, 'moving_miyu', effectFunction, null, false);
        return node;
    }
    setMsgGap(gap) {
        this._msgGap = gap;
    }
    _onClickMsgPanel(event) {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT);
        var scene = G_SceneManager.getTopScene();
        if (scene && scene.getName() == 'main') {
            this._resourceNode.active = false;
        }
    }
    _onClickWorldVoice(sender) {
    }
    _onClickGuildVoice(sender) {
    }
    _onClickUnReadHint(sender) {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT, [ChatConst.CHANNEL_PRIVATE]);
    }
    _onMenuClick(sender) {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MAIL);
    }
    _onRecordVoiceTouchListener(target, isPress) {
        target.setScale(isPress && this._scale * 1.1 || this._scale);
    }
    _onEventVoiceRecordChangeNotice(event, isFinish) {
        // if (isFinish) {
        //     this._buttonWorld.forceFinishRecord();
        //     this._buttonGuild.forceFinishRecord();
        // } else {
        //     this._buttonWorld.cancelRecordVoice();
        //     this._buttonGuild.cancelRecordVoice();
        // }
    }
    _onEventUICloseChatMainView(event, close) {
        this._resourceNode.active = true;
    }
    isInRecordVoice() {
        return false;
       // return this._buttonWorld.isInRecordVoice() || this._buttonGuild.isInRecordVoice();
    }

}
