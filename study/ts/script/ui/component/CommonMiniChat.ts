import { G_ResolutionManager, G_SignalManager, G_SceneManager, G_UserData } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import { handler } from "../../utils/handler";
import { FunctionConst } from "../../const/FunctionConst";
import { FunctionCheck } from "../../utils/logic/FunctionCheck";
import ChatMiniNode from "../../scene/view/chat/ChatMiniNode";
import ChatMiniMsgScrollView from "../../scene/view/chat/ChatMiniMsgScrollView";
import { WayFuncDataHelper } from "../../utils/data/WayFuncDataHelper";
import { ChatConst } from "../../const/ChatConst";
import UIHelper from "../../utils/UIHelper";

var EXPORTED_METHODS = [
    'setMsgGap',
    'isInRecordVoice',
    'getPanelDanmu'
];
const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonMiniChat extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRoot: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelPrivateChatHint: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _buttonWorld: cc.Node = null;//CommonVoiceButton
    @property({
        type: cc.Node,
        visible: true
    })
    _buttonGuild: cc.Node = null;

    @property({
        type: ChatMiniMsgScrollView,
        visible: true
    })
    _chatMsgScrollView: ChatMiniMsgScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDanmu: cc.Node = null;

    @property(cc.Prefab)
    ChatMiniMsgItemCell: cc.Prefab = null;

    _msgGap: number;
    _scale: any;
    _signalChatGetMessage: any;
    _signalRedPointUpdateChart: any;
    _signalSystemMsgReceive: any;
    _signalUserLevelUpdate: any;
    _signalVoiceRecordChangeNotice: any;
    _signalUICloseChatMainView: any;
    _channelId: any;

    onLoad() {
        this._init();
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
        this._buttonWorld.active = false;
        this._buttonGuild.active = false;
        this._onCreate();
    }
    onEnable() {
        this.onEnter();
    }
    onDisable() {
        this.onExit();
    }
    _onCreate() {

    }
    onEnter() {

        this._createScrollView();
        this._createEffectNode(this._panelPrivateChatHint);

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
        // var showRedPoint = redPointHelper.isModuleReach(FunctionConst.FUNC_CHAT);
        // this._panelPrivateChatHint.setVisible(showRedPoint);
    }
    _createEffectNode(effectRootNode) {
        // var TextHelper = require('TextHelper');
        // var EffectGfxNode = require('EffectGfxNode');
        // function effectFunction(effect) {
        //     if (TextHelper.stringStartsWith(effect, 'effect_')) {
        //         var subEffect = new EffectGfxNode(effect);
        //         subEffect.play();
        //         return subEffect;
        //     } else {
        //         return display.newNode();
        //     }
        // }
        // var node = G_EffectGfxMgr.createPlayMovingGfx(effectRootNode, 'moving_miyu', effectFunction, null, false);
        // return node;
    }
    _onClickMsgPanel(event) {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT);
        var scene = G_SceneManager.getTopScene();
        if (scene && scene.getName() == 'main') {
            this._resourceNode.active = (false);
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
        this._resourceNode.active = (true);
    }

    getPanelDanmu(): cc.Node {
        return this._panelDanmu;
    }

    setDanmuVisible(v: boolean) {
        this._panelDanmu.active = v;
    }
    
    _init() {
        var widget = this.node.getComponent(cc.Widget);
        if (!widget) {
            widget = this.node.addComponent(cc.Widget);
        }
        widget.isAlignLeft = true;
        widget.isAlignBottom = true;
        widget.left = 0;
        widget.bottom = 0;
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());

        if (this._resourceNode) {
            this._resourceNode.setContentSize(G_ResolutionManager.getDesignCCSize());
            let widget1 = this._resourceNode.getComponent(cc.Widget);
            if (!widget1) {
                widget1 = this._resourceNode.addComponent(cc.Widget);
                widget1.horizontalCenter = 0;
                widget1.verticalCenter = 0;
                widget1.isAlignHorizontalCenter = true;
                widget1.isAlignVerticalCenter = true;
            }
        }

        // this._target.onNodeEvent('exit', function () {
        //     this._signalUserLevelUpdate.remove();
        //     this._signalUserLevelUpdate = null;
        //     if (this._chatMiniNode) {
        //         this._chatMiniNode.onExit();
        //     }
        // });
        // this._target.onNodeEvent('enter', function () {
        //     this._signalUserLevelUpdate = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventUserLevelUpdate));
        //     var newCreate = this._onEventUserLevelUpdate();
        //     if (this._chatMiniNode && !newCreate) {
        //         this._chatMiniNode.onEnter();
        //     }
        // });
    }
    setMsgGap(gap) {
        this._msgGap = gap;
    }
    _onEventUserLevelUpdate(event, param) {
        var chatShow = FunctionCheck.funcIsShow(FunctionConst.FUNC_CHAT);
        var newCreate = false;
        this.node.active = (chatShow);
        return true;
    }
    isInRecordVoice() {
        return false;
        // return this._buttonWorld.isInRecordVoice() || this._buttonGuild.isInRecordVoice();
    }
}
