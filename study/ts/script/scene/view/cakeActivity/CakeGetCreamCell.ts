const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { CakeActivityDataHelper } from '../../../utils/data/CakeActivityDataHelper';
import { G_ConfigLoader, G_GameAgent, G_SceneManager } from '../../../init';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { PopupItemInfo } from '../../../ui/PopupItemInfo';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import CommonUI from '../../../ui/component/CommonUI';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Lang } from '../../../lang/Lang';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import { handler } from '../../../utils/handler';

@ccclass
export default class CakeGetCreamCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;


    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAward: cc.Sprite = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeResource: CommonResourceInfo = null;

    

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonBuy: CommonButtonLevel1Normal = null;
    _info: any;
    _vipPayInfo: any;

  

    //-------------------------------
    onCreate() {
        var size = this._panelBg.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._info = null;
        this._nodeResource.setImageResScale(0.9);
        this._nodeResource.setTextCountSize(24);
        this._buttonBuy.addTouchEventListenerEx(handler(this,this._onClickBuy),true);
    }
    updateUI(id) {
        var info = CakeActivityDataHelper.getCakeChargeConfig(id);
        this._info = info;
        this._imageAward.node.addComponent(CommonUI).loadTexture(Path.getAnniversaryImg(info.award1));
        this._textCount.string = ('x' + info.size1);
        this._nodeResource.updateUI(info.cost_type, info.cost_value, info.cost_size);
        this._nodeResource.setTextColor(new cc.Color(255, 255, 255));
        this._nodeResource.setTextOutLine(new cc.Color(209, 74, 20));
        this._buttonBuy.setString(Lang.get('shop_btn_buy'));
    }
    _onClickBuy() {
        if (CakeActivityDataHelper.isCanRecharge() == false) {
            return;
        }
        var [retValue] = UserCheck.enoughJade2(this._info.cost_size, true);
        if (retValue == false) {
            return;
        }
        this.dispatchCustomCallback(1);
    }
    _onClickIcon() {
        G_SceneManager.openPopup("prefab/common/PopupItemInfo", (popup: PopupItemInfo) => {
            popup.updateUI(this._info.type1, this._info.value1);
            popup.openWithAction();
        });
    }

}