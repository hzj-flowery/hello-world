const { ccclass, property } = cc._decorator;

import VipRechargeCell from './VipRechargeCell'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { G_UserData, G_EffectGfxMgr } from '../../../init';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { Lang } from '../../../lang/Lang';

var DIAMOND_NUM_LIST = {
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

@ccclass
export default class VipRechargePageView extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRoot: cc.Node = null;

    @property({
        type: VipRechargeCell,
        visible: true
    })
    _fileNode1: VipRechargeCell = null;

    @property({
        type: VipRechargeCell,
        visible: true
    })
    _fileNode2: VipRechargeCell = null;

    @property({
        type: VipRechargeCell,
        visible: true
    })
    _fileNode3: VipRechargeCell = null;

    @property({
        type: VipRechargeCell,
        visible: true
    })
    _fileNode4: VipRechargeCell = null;


    _callback: any;
    _itemList: any[];


    ctor(callBack) {
        this._callback = callBack;
    }

    onCreate() {
        var contentSize = this._panelRoot.getContentSize();
        this.node.setContentSize(contentSize);
    }
    updateUI(itemList: any[]) {
        this._itemList = itemList;
        //dump(itemList);
        for (var i = 1; i <= 8; i++) {
            var fileNode = this['_fileNode' + i];
            if (fileNode) {
                fileNode.node.active = (false);
            }
        }
        for (var i = 1; i <= itemList.length; i++) {
            var itemValue = itemList[i - 1];
            var fileNode = this['_fileNode' + i];
            if (fileNode) {
                fileNode.node.active = (true);
                this._updateRechargeItem(fileNode, itemValue);
            }
        }
    }
    _updateRechargeItem(itemNode: VipRechargeCell, vipPayData) {
        var isFirstRecharge = !vipPayData.isBuyed;
        var firstBuyResetTime = G_UserData.getVipPay().getFirstBuyResetTime();
        isFirstRecharge = vipPayData.buyTime == 0 || vipPayData.buyTime < firstBuyResetTime;
        var vipPayCfg = vipPayData.cfg;
        if (vipPayCfg.effect && vipPayCfg.effect != '') {
            //dump(vipPayCfg.effect);
            var node = itemNode.Node_effect;
            node.removeAllChildren();
            G_EffectGfxMgr.createPlayMovingGfx(node, vipPayCfg.effect);
        }
        var itemInfo = itemNode.ItemInfo;
        itemInfo.Image_down.active = (false);
        itemInfo.addTouchEventListener(handler(this, this._onTouchCallBack));
        //itemInfo.setSwallowTouches(false);
        var vipIconPath = Path.getCommonIcon('vip', vipPayCfg.icon_id);
        //dump(vipIconPath);
        itemInfo.updateImageView('Image_gold_icon', { texture: vipIconPath });
        var num = DIAMOND_NUM_LIST[vipPayCfg.rmb]!=null?DIAMOND_NUM_LIST[vipPayCfg.rmb]: 1;
        var path = "";
        if (num < 10) {
            path = "txt_yuanbao_0" + num;
        }
        else {
            path = "txt_yuanbao_" + num;
        }
        var vipNumPath = Path.getVipImage(path);
        itemInfo.updateImageView('Image_gold_num', { texture: vipNumPath });
        itemInfo.setTag(vipPayCfg.id);
        var sendValue = vipPayCfg.gold_rebate_2;
        if (isFirstRecharge == true) {
            sendValue = vipPayCfg.gold_rebate_1;
        }

        if (isFirstRecharge) {
            itemInfo.updateImageView('Image_tip', { texture: Path.getVipImage('img_vip_board01c') });
            itemInfo.updateLabel('Text_send_value', { visible: false });
        } else if (sendValue <= 0) {
            itemInfo.updateImageView('Image_tip', { visible: false });
        } else {
            itemInfo.updateImageView('Image_tip', {
                visible: true,
                texture: Path.getVipImage('img_vip_board01b')
            });
            itemInfo.updateLabel('Text_send_value', {
                text: sendValue,
                visible: true
            });
        }
        itemInfo.updateLabel('Text_rmb_num', { text: Lang.get('lang_recharge_money', { num: vipPayCfg.rmb }) });
        // itemInfo.updateImageView('Image_rmb_num', { visible: false });

    }
    _onTouchCallBack(sender) {
        // if (state == ccui.TouchEventType.began) {
        //     sender.getSubNodeByName('Image_down').setVisible(true);
        // }
        // if (state == ccui.TouchEventType.ended) {
        //     var moveOffsetX = math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        //     var moveOffsetY = math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        //     sender.getSubNodeByName('Image_down').setVisible(false);
        //     if (moveOffsetX < 20 && moveOffsetY < 20) {
        //         var vipIndex = sender.getTag();
        //         logWarn('VipRechargePageView ------------  ' + tostring(vipIndex));
        //         this.dispatchCustomCallback(vipIndex);
        //     }
        // }
        // if (state == ccui.TouchEventType.canceled) {
        //     sender.getSubNodeByName('Image_down').setVisible(false);
        // }
        var vipIndex = sender.getTag();
        //logWarn('VipRechargePageView ------------  ' + tostring(vipIndex));
        this.dispatchCustomCallback(vipIndex);
    }
    onEnter() {
    }
    onExit() {
    }

}
