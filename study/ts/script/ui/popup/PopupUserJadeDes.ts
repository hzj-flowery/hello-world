import { G_ResolutionManager } from "../../init";
import EquipDesJadeIcon from "../../scene/view/equipmentJade/EquipDesJadeIcon";
import { Path } from "../../utils/Path";
import PopupBase from "../PopupBase";
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupUserJadeDes extends PopupBase{
    
    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelBg: cc.Node = null;

    protected preloadResList = [
        {path:Path.getPrefab("EquipDesJadeIcon","equipment"),type:cc.Prefab}
    ];
    private _equipData:any;
    private _equipDesJadeIcon:any;
    private _parentView:any;
    setinitData(pv,equipData) {
        this._equipData = equipData;
        this._parentView =pv;
    }
    onCreate() {
        this._equipDesJadeIcon = cc.resources.get(Path.getPrefab("EquipDesJadeIcon","equipment"))
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onClick,this);
        this._initSlots();
    }
    _initSlots() {
        var nums = this._equipData.getJadeSlotNums();
        var size = this._panelBg.getContentSize();
        size.width = nums * 74 + 14;
        this._panelBg.setContentSize(size);
    }
    onEnter() {
        this._updateView();
    }
    onExit() {
    }
    _updateView() {
        var jades = this._equipData.getUserDetailJades() || {};
        var config = this._equipData.getConfig();
        var slotinfo = config.inlay_type.split('|');
        var count = 0;
        this._panelBg.removeAllChildren();
        var panelSize = this._panelBg.getContentSize();
        for (var i in slotinfo) {
            var value = slotinfo[i];
            if (parseInt(value) > 0) {
                var node = (cc.instantiate(this._equipDesJadeIcon) as cc.Node);
                var slot = node.getComponent(EquipDesJadeIcon);
                this['_slot' + i] = slot;
                this._panelBg.addChild(node);
                node.setPosition(new cc.Vec2(count * 74 + 8 + 36-panelSize.width/2, 80-panelSize.height/2));
                slot.updateIcon(jades[i] || 0);
                count = count + 1;
            }
        }
        var nodePos = this._parentView.node.convertToWorldSpaceAR(new cc.Vec2(0, 0));
        var nodeSize = this._parentView.node.getContentSize();
        var posX = nodePos.x + panelSize.width/2+72;
        var posY = nodePos.y - (panelSize.height*0.5 - 32);
        var dstPos = this.node.convertToNodeSpaceAR(new cc.Vec2(posX, posY));
        this._panelBg.setPosition(dstPos);
    }
    _onClick() {
        this.close();
    }
}