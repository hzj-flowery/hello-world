import { TacticsConst } from "../../const/TacticsConst";
import { Colors, G_SceneManager, G_UserData } from "../../init";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import CommonButton from "../component/CommonButton";
import PopupBase from "../PopupBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupTacticsDes extends PopupBase {
    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panelBg: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgTip: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    }) _desNode: cc.Node = null;

    private _fromNode: cc.Node;
    private _baseId: any;
    private _label: cc.Label;
    private _fromNodePos: cc.Vec2;

    ctor(fromNode, baseId) {
        this._fromNode = fromNode;
        this._baseId = baseId;
    }
    onCreate() {
        this._label = null;
        //this._panelTouch.setContentSize(this.node.width, this.node.height);
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._onClick));
        this._fromNodePos = this._fromNode.convertToWorldSpaceAR(cc.v2(0, 0));
    }
    onEnter() {
        this._updateView();
    }
    onExit() {
    }
    open() {
        var scene = G_SceneManager.getRunningScene();
        scene.addChildToPopup(this.node);
    }
    close() {
        this.onClose();
        this.signal.dispatch('close');
        this.node.removeFromParent();
    }
    _updateView() {
        var unitData = G_UserData.getTactics().getUnitDataWithBaseId(this._baseId);
        var config = unitData.getConfig();
        if (this._label == null) {
            this._label = UIHelper.createWithTTF('', Path.getCommonFont(), 22);
            this._label.node.setAnchorPoint(cc.v2(0, 1));
            this._label.node.color = (Colors.TacticsDescriptionColor);
            this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._label.node.width = (375);
            this._desNode.addChild(this._label.node);
        }
        var description = '';
        var [_, limitStrs, suitType] = G_UserData.getTactics().getSuitInfoWithTacticsId(this._baseId);
        if (suitType == TacticsConst.SUIT_TYPE_ALL) {
            description = Lang.get('tactics_suitable_all');
        } else {
            for (var i in limitStrs) {
                var v = limitStrs[i];
                description = description + v;
                description = description + Lang.get('tactics_effective_des_contact');
            }
        }
        this._label.string = (description);
        var txtHeight = this._label.node.getContentSize().height;
        var panelHeight = 132;
        if (txtHeight > 132 - 60) {
            panelHeight = 60 + txtHeight;
            this._imgTip.node.y = (panelHeight - 20);
            this._desNode.y = (panelHeight - 49);
            var bgSize = this._panelBg.getContentSize();
            this._panelBg.setContentSize(cc.size(bgSize.width, panelHeight));
        } else {
            this._label.node.setAnchorPoint(cc.v2(0.5, 0.5));
            this._label.node.setPosition(cc.v2(185, -35));
        }
        var nodePos = this._fromNodePos;
        var posX = nodePos.x - this._panelBg.getContentSize().width / 2;
        var posY = nodePos.y - this._panelBg.getContentSize().height / 2;
        var dstPos = this.node.convertToNodeSpace(cc.v2(posX, posY));
        this._panelBg.setPosition(dstPos);
    }
    _onClick() {
        this.close();
    }
}