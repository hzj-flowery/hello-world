import { Colors, G_ResolutionManager, G_SceneManager, G_UserData } from "../../init";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import PopupBase from "../PopupBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupTacticsDetail extends PopupBase {
    private _fromNode: any;
    private _baseId: any;
    private _label: cc.Label;
    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch: cc.Node = null;
    private _fromNodePos: any;
    @property({
        type: cc.Label,
        visible: true
    }) _textName: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    }) _desNode: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    }) _panelBg: cc.Node = null;
    ctor(fromNode, baseId) {
        this._fromNode = fromNode;
        this._baseId = baseId;
    }
    onCreate() {
        this._label = null;
        //this._panelTouch.setContentSize(this.node.width, this.node.height);
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._onClick));
        this._fromNodePos = this._fromNode.node.convertToWorldSpaceAR(cc.v2(0, 0));
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
        this._textName.string = (Lang.get('tactics_description_pop_name', { name: config.name }));
        if (this._label == null) {
            this._label = UIHelper.createWithTTF('', Path.getCommonFont(), 22);
            this._label.lineHeight = 25;
            this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._label.node.setAnchorPoint(cc.v2(0, 1));
            this._label.node.color = (Colors.DARK_BG_ONE);
            this._label.node.width = (436);
            this._desNode.addChild(this._label.node);
        }
        var description = config.description;
        this._label.string = (description);
        UIHelper.updateLabelSize(this._label);
        var txtHeight = this._label.node.getContentSize().height;
        var panelHeight = 132;
        if (txtHeight > 132 - 60) {
            panelHeight = 60 + txtHeight;
            this._textName.node.y = (panelHeight/2 - 14);
            this._desNode.y = (panelHeight/2 - 49);
            var bgSize = this._panelBg.getContentSize();
            this._panelBg.setContentSize(cc.size(bgSize.width, panelHeight));
        }
        var nodePos = this._fromNodePos;
        var posX = nodePos.x + this._panelBg.getContentSize().width / 2 + 50;
        var posY = nodePos.y - this._panelBg.getContentSize().height / 2 - 20;
        var size = this._panelBg.getContentSize();
        var ccSize = G_ResolutionManager.getDesignCCSize();
        var offsetSize = cc.size(0, 0);
        offsetSize.width = Math.max(0, (this.node.width - cc.view.getDesignResolutionSize().width) * 0.5);
        offsetSize.height = Math.max(0, (this.node.height - cc.view.getDesignResolutionSize().height) * 0.5);
        if (posX + size.width * 0.5 > ccSize.width) {
            posX = nodePos.x - this._panelBg.getContentSize().width / 2 - 50;
        }
        if (posY - size.height * 0.5 < offsetSize.height) {
            posY = nodePos.y + this._panelBg.getContentSize().height / 2 + 20;
        }
        var dstPos = this.node.convertToNodeSpace(cc.v2(posX, posY));
        this._panelBg.setPosition(dstPos);
    }
    _onClick() {
        this.close();
    }
}