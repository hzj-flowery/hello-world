import { SignalConst } from "../../../const/SignalConst";
import UIGuideConst from "../../../const/UIGuideConst";
import { G_EffectGfxMgr, G_SignalManager, G_UserData } from "../../../init";
import CommonGuildTalk from "../../../ui/component/CommonGuildTalk";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import UIGuideNode from "./UIGuideNode";

const { ccclass, property } = cc._decorator;
@ccclass
export default class UIGuideRootNode extends ViewBase {

    private _bindList = {};
    private _signalRecvRoleInfo;

    public onCreate() {
    }

    public onEnter() {
        this._signalRecvRoleInfo = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onEventRecvRoleInfo));
        this._refreshAllGuideUI();
    }

    public onExit() {
        this._signalRecvRoleInfo.remove();
        this._signalRecvRoleInfo = null;
    }

    private _GUIDE_TYPE_MAIN_CITY_FIGHT(unitData): cc.Node {
        let node = new cc.Node();
        cc.resources.load(Path.getCommonPrefab("CommonGuildTalk"), cc.Prefab, (err, res: cc.Prefab) => {
            if (res == null || !node.isValid) {
                return;
            }
            let guildTalk = cc.instantiate(res).getComponent(CommonGuildTalk);
            guildTalk.setText(unitData.getConfig().text);
            node.addChild(guildTalk.node);
        });
        return node;
    }

    private _GUIDE_TYPE_CHAPTER_ICON(node: cc.Node, unitData): cc.Node {
        return this._GUIDE_TYPE_STAGE_ICON(node, unitData);
    }

    private _GUIDE_TYPE_STAGE_ICON(node: cc.Node, unitData): cc.Node {
        let effectNode = G_EffectGfxMgr.createPlayGfx(node, 'effect_finger').node;
        return effectNode;
    }

    private _refreshAllGuideUI() {
        for (let k in this._bindList) {
            var v = this._bindList[k];
            if (v) {
                this._refreshGuide(v);
            }
        }
    }

    private _onEventRecvRoleInfo(event) {
        this._refreshAllGuideUI();
    }

    private _createGuideUI(guideType, param, rootNode?: cc.Node): cc.Node {
        var unitData = G_UserData.getUiGuide().createUIGuideUnitData(guideType, param);
        var guideNode = new cc.Node().addComponent(UIGuideNode);
        guideNode.init(unitData);
        var node = null;
        if (guideType == UIGuideConst.GUIDE_TYPE_MAIN_CITY_FIGHT) {
            node = this._GUIDE_TYPE_MAIN_CITY_FIGHT(unitData);
            guideNode.node.addChild(node);
        } else if (guideType == UIGuideConst.GUIDE_TYPE_CHAPTER_ICON) {
            node = this._GUIDE_TYPE_CHAPTER_ICON(guideNode.node, unitData);
        } else if (guideType == UIGuideConst.GUIDE_TYPE_STAGE_ICON) {
            node = this._GUIDE_TYPE_STAGE_ICON(guideNode.node, unitData);
        }
        // if (node) {
        //     guideNode.node.addChild(node);
        // }
        guideNode.node.setPosition(unitData.getConfig().x - rootNode.width * rootNode.anchorX, unitData.getConfig().y - rootNode.height * rootNode.anchorY);
        return guideNode.node;
    }

    private _refreshGuide(v) {
        var guideType = v[0];
        let param = v[1];
        let rootNode = v[2];
        var isShow = G_UserData.getUiGuide().needShowGuide(guideType, param);
        if (isShow) {
            this._addGuideUI(guideType, param, rootNode);
        } else {
            this._removeGuideUI(guideType, param, rootNode);
        }
    }

    public bindUIGuide(guideType, param, rootNode: cc.Node) {
        param = param || 0;
        if (!G_UserData.getUiGuide().hasUIGuide(guideType, param)) {
            return;
        }
        var oldBindData = this._bindList[guideType + ('_' + param)];
        if (oldBindData) {
            this._removeGuideUI(guideType, param, oldBindData[3 - 1]);
        }
        this._bindList[guideType + ('_' + param)] = [
            guideType,
            param,
            rootNode
        ];
        this._refreshGuide(this._bindList[guideType + ('_' + param)]);
    }

    public unbindUIGuide(guideType, param) {
        param = param || 0;
        var oldBindData = this._bindList[guideType + ('_' + param)];
        if (oldBindData) {
            this._removeGuideUI(guideType, param, oldBindData[3 - 1]);
        }
        this._bindList[guideType + ('_' + param)] = null;
    }

    public unbindAllUIGuide() {
        for (let k in this._bindList) {
            var v = this._bindList[k];
            this._removeGuideUI(v[1 - 1], v[2 - 1], v[3 - 1]);
        }
        this._bindList = {};
    }

    public visibleBindNode(guideType, param, visible) {
        param = param || 0;
        var bindData = this._bindList[guideType + ('_' + param)];
        if (!bindData) {
            return;
        }
        var rootNode = bindData[3 - 1];
        var uiGuideNode = rootNode.getChildByName('UIGuideNode');
        if (uiGuideNode) {
            uiGuideNode.setVisible(visible);
        }
    }

    private _addGuideUI(guideType, param, rootNode) {
        param = param || 0;
        var uiGuideNode = rootNode.getChildByName('UIGuideNode');
        if (uiGuideNode) {
            return;
        }
        var node = this._createGuideUI(guideType, param, rootNode);
        node.name = ('UIGuideNode');
        rootNode.addChild(node);
    }

    private _removeGuideUI(guideType, param, rootNode: cc.Node) {
        var uiGuideNode = rootNode.getChildByName('UIGuideNode');
        if (uiGuideNode) {
            uiGuideNode.destroy();
        }
    }
}