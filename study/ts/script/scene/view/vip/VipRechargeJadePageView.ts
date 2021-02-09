import VipRechargeCell from "./VipRechargeCell";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { handler } from "../../../utils/handler";
import { G_EffectGfxMgr } from "../../../init";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import VipRechargeJadeCell from "./VipRechargeJadeCell";
var JADE_NUM_LIST = {
    [1]: 0,
    [6]: 1,
    [30]: 2,
    [68]: 3,
    [98]: 4,
    [188]: 5,
    [198]: 6,
    [328]: 7,
    [648]: 8,
    [2000]: 9,
    [5000]: 10,
    [8000]: 11,
    [10000]: 12
};
const {ccclass, property} = cc._decorator;
@ccclass
export default class VipRechargeJadePageView extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRoot: cc.Node = null;
 
    @property({
        type: VipRechargeJadeCell,
        visible: true
    })
    _fileNode1: VipRechargeJadeCell = null;
 
    @property({
        type: VipRechargeJadeCell,
        visible: true
    })
    _fileNode2: VipRechargeJadeCell = null;
 
    @property({
        type: VipRechargeJadeCell,
        visible: true
    })
    _fileNode3: VipRechargeJadeCell = null;
 
    @property({
        type: VipRechargeJadeCell,
        visible: true
    })
    _fileNode4: VipRechargeJadeCell = null;

    
    _callback: any;
    _itemList: any[];

    ctor(callBack) {
        this._callback = callBack;
    }

    onCreate() {
        var contentSize = this._panelRoot.getContentSize();
        this.node.setContentSize(contentSize);
    }
    updateUI(itemList) {
        this._itemList = itemList;
        this._itemList.sort(function(a,b):number{
            return a.cfg.rmb-b.cfg.rmb;
        })
        for (let i = 1; i <= 8; i++) {
            var fileNode = this['_fileNode' + i];
            if (fileNode) {
                fileNode.node.active = (false);
            }
        }
        for (let i = 1;i <=itemList.length;i++) {
            var itemValue = itemList[i-1];
            var fileNode = this['_fileNode' + i];
            if (fileNode) {
                fileNode.node.active = (true);
                this._updateRechargeItem(fileNode, itemValue);
            }
        }
    }
    _updateRechargeItem(itemNode:VipRechargeJadeCell, vipPayData) {
        var vipPayCfg = vipPayData.cfg;
        if (vipPayCfg.effect && vipPayCfg.effect != '') {
            var node = itemNode.Node_effect;
            node.removeAllChildren();
            G_EffectGfxMgr.createPlayMovingGfx(node, vipPayCfg.effect);
        }
        var itemInfo = itemNode.ItemInfo;
        itemInfo.Image_down.active = (false);
        itemInfo.setTag(vipPayCfg.id);
        itemInfo.addTouchEventListener(handler(this, this._onTouchCallBack));
        var index = JADE_NUM_LIST[vipPayCfg.rmb]!=null?JADE_NUM_LIST[vipPayCfg.rmb]:1;
        var strPath = ""
        if(index<10)
        {
            strPath = "txt_yubi_0"+index;
        }
        else
        {
            strPath = "txt_yubi_"+index;
        }
        var path = Path.getVipImage(strPath);
        itemInfo.updateImageView('Image_jade_num', { texture: path });
        var vipIconPath = Path.getCommonIcon('vip', vipPayCfg.icon_id);
        itemInfo.updateImageView('Image_jade', { texture: vipIconPath });
        itemInfo.updateLabel('Text_rmb', { text: Lang.get('lang_recharge_money', { num: vipPayCfg.rmb }) });
    }
    _onTouchCallBack(sender, state) {
        var vipIndex = sender.getTag();
        this.dispatchCustomCallback(vipIndex);
    }
    onEnter() {
    }
    onExit() {
    }
}
