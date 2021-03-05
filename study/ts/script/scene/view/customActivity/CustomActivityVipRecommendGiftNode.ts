import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import { handler } from "../../../utils/handler";
import { assert } from "../../../utils/GlobleFunc";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_ConfigLoader, G_GameAgent } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Lang } from "../../../lang/Lang";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomActivityVipRecommendGiftNode extends cc.Component {
    

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _nodeIcon: CommonIconTemplate = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonBuy: CommonButtonLevel1Highlight = null;


    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    private _configInfo:any;


    onLoad() {
        this._buttonBuy.addClickEventListenerEx(handler(this, this._onClickBuy));
    }
    updateUI(data) {
        var awards = data.getAwards();
        var award = awards[0];
      //assert((award, cc.js.formatStr('CustomActivityVipRecommendGiftNode award is empty'));
        var param = TypeConvertHelper.convert(award.type, award.value, award.size);
        
        var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY).get(data.getProduct_id());
        this._configInfo = configInfo;
        var rmb = configInfo.rmb;
        var gold = configInfo.gold;
        var buttonName = '';
        var isBuyed = data.getPurchased_times() >= 1;
        if (isBuyed) {
            buttonName = Lang.get('common_already_buy');
        } else {
            buttonName = Lang.get('common_rmb', { num: rmb });
        }
        var tip = Lang.get('common_go_cost', { num: gold });
        this._nodeIcon.unInitUI();
        this._nodeIcon.initUI(award.type, award.value, award.size);
        this._textName.string = (param.name);
        this._textName.node.color = (param.icon_color);
        this._buttonBuy.setString(buttonName);
        this._buttonBuy.setEnabled(!isBuyed);
        this._textTip.string = (tip);
    }
    setScale(scale) {
        this.node.setScale(scale);
    }
    _onClickBuy() {
        if (this._configInfo == null) {
            return;
        }
        G_GameAgent.pay(this._configInfo.id, this._configInfo.rmb, this._configInfo.product_id, this._configInfo.name, this._configInfo.name);
    }
}