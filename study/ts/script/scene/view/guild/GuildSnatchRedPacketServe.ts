import { AudioConst } from "../../../const/AudioConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_AudioManager, G_Prompt, G_SceneManager, G_SignalManager, G_TopLevelNode, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { handler } from "../../../utils/handler";
import { Util } from "../../../utils/Util";
import GuildCommonSnatchRedPacketNode from "./GuildCommonSnatchRedPacketNode";
import PopupGuildOpenRedPacket from "./PopupGuildOpenRedPacket";

export class GuildSnatchRedPacketServe {
    _rootNode: any;
    _filterSceneList: any[];
    _isShowSnatchRedPacketUI: any;
    _signalChangeScene: any;
    _signalGuildCanSnatchRedPacketNumChange: any;
    _signalGuildRedPacketOpenNotice: any;
    _popupSignal: any;
    _itemNode: any;

    constructor() {
        this._rootNode = null;
        this._filterSceneList = ['login'];
        this._isShowSnatchRedPacketUI = null;
        this._registerEvents();
    }
    _registerEvents() {
        if (!this._signalChangeScene) {
            this._signalChangeScene = G_SignalManager.add(SignalConst.EVENT_SCENE_TRANSITION, handler(this, this._onEventChangeScene));
        }
        if (!this._signalGuildCanSnatchRedPacketNumChange) {
            this._signalGuildCanSnatchRedPacketNumChange = G_SignalManager.add(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE, handler(this, this._onEventCanSnatchRedPacketNumChange));
        }
        if (!this._signalGuildRedPacketOpenNotice) {
            this._signalGuildRedPacketOpenNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE, handler(this, this._onEventGuildRedPacketOpenNotice));
        }
        if (this._rootNode == null) {
            this._createRootNode();
        }
    }
    _unRegisterEvents() {
        if (this._signalChangeScene) {
            this._signalChangeScene.remove();
            this._signalChangeScene = null;
        }
        if (this._signalGuildCanSnatchRedPacketNumChange) {
            this._signalGuildCanSnatchRedPacketNumChange.remove();
            this._signalGuildCanSnatchRedPacketNumChange = null;
        }
        if (this._signalGuildRedPacketOpenNotice) {
            this._signalGuildRedPacketOpenNotice.remove();
            this._signalGuildRedPacketOpenNotice = null;
        }
    }
    start() {
        this._registerEvents();
    }
    _onEventGuildRedPacketOpenNotice(event, redPacketData, openRedBagUserList, snatchSuccess) {
        this._closePopup();
        var redPacketOpenData = UserDataHelper.getOpenRedPacketData(redPacketData, openRedBagUserList);
        cc.resources.load("prefab/guild/PopupGuildOpenRedPacket", cc.Prefab, () => {
            var popup: PopupGuildOpenRedPacket = Util.getNode('prefab/guild/PopupGuildOpenRedPacket', PopupGuildOpenRedPacket);
            popup.initData(redPacketOpenData);
            popup.name = ('PopupGuildOpenRedPacket');
            popup.node.name = ('PopupGuildOpenRedPacket');
            popup.openWithAction();
            this._popupSignal = popup.signal.add(handler(this, this._onPopupPatrolClose));
            if (snatchSuccess) {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_RED_PACKAGE_RECIEVE_SUCCESS);
            }
        })
    }
    _onPopupPatrolClose(event) {
        if (event == 'close') {
            if (this._popupSignal) {
                this._popupSignal.remove();
                this._popupSignal = null;
            }
            var hintFlag = G_UserData.getGuild().isLastCanSnatchRedPacketHintFlag();
            if (hintFlag) {
                G_UserData.getGuild().setLastCanSnatchRedPacketHintFlag(false);
                G_Prompt.showTip(Lang.get('guild_snatch_redpacket_num_limit_hint'));
            }
        }
    }
    _closePopup() {
        // let runningScene = G_SceneManager.getRunningScene();
        // runningScene.getComponentInChildren
        var popupGuildOpenRedPacket = G_SceneManager.getRunningScene().getPopupByName('PopupGuildOpenRedPacket') as cc.Node;
        if (popupGuildOpenRedPacket) {
            popupGuildOpenRedPacket.getComponent(PopupGuildOpenRedPacket).close();
        }
    }
    _onEventChangeScene(event, enter, sceneName) {
        if (enter) {
            if (this._filterSceneList.indexOf(sceneName) == -1) {
                this.show();
            } else {
                this.hide();
            }
        }
    }
    _onEventCanSnatchRedPacketNumChange(event, num) {
        var redPacketData = G_UserData.getGuild().getCurrSnatchRedPacket();
        var num = UserDataHelper.getCanSnatchRedPacketNum();
        if (redPacketData && num > 0) {
            this._showSnatchRedPacketUI(redPacketData);
        } else {
            this._removeSnatchRedPacketUI();
        }
    }
    _showSnatchRedPacketUI(redPacketData) {
        if (this._isShowSnatchRedPacketUI) {
            if (this._itemNode) {
                this._itemNode.getComponent(GuildCommonSnatchRedPacketNode).updateRedPacketData(redPacketData);
            }
            return;
        }

        let res = "prefab/guild/GuildCommonSnatchRedPacketNode"
        cc.resources.load(res, () => {
            var resource = cc.resources.get(res);
            var itemNode = (cc.instantiate(resource) as cc.Node).getComponent(GuildCommonSnatchRedPacketNode);
            itemNode.node.setPosition(0, 0);
            itemNode.initData(redPacketData);
            this._rootNode.addChild(itemNode.node);
            this._itemNode = itemNode.node;
            this._isShowSnatchRedPacketUI = true;
        });

    }
    _removeSnatchRedPacketUI() {
        if (this._rootNode != null) {
            this._rootNode.removeAllChildren();
            this._itemNode = null;
            this._isShowSnatchRedPacketUI = null;
        }
    }
    clear() {
        this._unRegisterEvents();
        this._removeSnatchRedPacketUI();
        if (this._rootNode != null) {
            this._rootNode.removeFromParent();
            this._rootNode = null;
        }
        this._popupSignal = null;
    }
    show() {
        //logWarn('GuildSnatchRedPacketServe show ');
        if (this._rootNode != null) {
            this._rootNode.active = (true);
        }
    }
    hide() {
        //logWarn('GuildSnatchRedPacketServe hide ');
        if (this._rootNode != null) {
            this._rootNode.active = (false);
        }
    }
    _createRootNode() {
        if (this._rootNode == null) {
            this._rootNode = new cc.Node("GuildSnatchRedPacketServe");
            G_TopLevelNode.addToSubtitleLayer(this._rootNode);
        }
    }
}