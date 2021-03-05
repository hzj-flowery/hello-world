import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_Prompt, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonNormalSmallPop from "../../../ui/component/CommonNormalSmallPop";
import CommonSelectNumNode from "../../../ui/component/CommonSelectNumNode";
import PopupAlert from "../../../ui/PopupAlert";
import PopupBase from "../../../ui/PopupBase";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { handler } from "../../../utils/handler";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { CurrencyHelper } from "./CurrencyHelper";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupCurrencyExchangeView extends PopupBase{
    name: 'PopupCurrencyExchangeView';
    @property({
        type: CommonNormalSmallPop,
        visible: true
    })
    _commonPop: CommonNormalSmallPop = null;
    @property({
        type: CommonSelectNumNode,
        visible: true
    })
    _commonSelectNum: CommonSelectNumNode = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _commonBtn: CommonButtonLevel0Highlight = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRadio: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textJade: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDiamond: cc.Label = null;
    
    

    
    
    private _curJadeNum:number;
    private _signalGetRechargeNotice :any;
    private _signalJadeBiExcharge :any;
    onCreate() {
        this.node.name = "PopupCurrencyExchangeView";
        this._curJadeNum = 1;
       
    }
    onEnter() {
        this._initCommonView();
        this._initJadeView();
        this._onNumSelect(1);
        this._signalGetRechargeNotice = G_SignalManager.add(SignalConst.EVENT_RECHARGE_NOTICE, handler(this, this._onEventGetRechargeNotice));
        this._signalJadeBiExcharge = G_SignalManager.add(SignalConst.EVENT_DIAMOND_EXCHANGE, handler(this, this._onEventJadeBiExcharge));
    }
    onExit() {
        if (this._signalGetRechargeNotice) {
            this._signalGetRechargeNotice.remove();
            this._signalGetRechargeNotice = null;
        }
        if (this._signalJadeBiExcharge) {
            this._signalJadeBiExcharge.remove();
            this._signalJadeBiExcharge = null;
        }
    }
    _onBtnClose() {
        this.close();
    }
    _initCommonView() {
        this._commonPop.setTitle(Lang.get('currency_diamond_title'));
        this._commonPop.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonSelectNum.setMaxLimitEx(9999);
        this._commonSelectNum.updateIncrement(1000);
        this._commonSelectNum.setCallBack(handler(this, this._onNumSelect));
        this._commonBtn.setString(Lang.get('currency_diamond_exchange'));
        this._commonBtn.addClickEventListenerEx(handler(this, this._onCurrExchange));
    }
    _initJadeView() {
        var num = CurrencyHelper.getCurJadeNum();
        var radio = CurrencyHelper.getDiamondExchangeRadio();
        this._textJade.string = (''+ (num));
        this._textRadio.string = (Lang.get('currency_diamond_radio', { radio: radio }));
    }
    _updateDiamond(num) {
        var radio = CurrencyHelper.getDiamondExchangeRadio();
        this._textJade.string = (''+ (num * radio));
    }
    _updateTxtJadeColor(isFlow) {
        var color = isFlow && Colors.uiColors.RED || Colors.BRIGHT_BG_ONE;
        this._textJade.node.color = (color);
    }
    _onNumSelect(num) {
        this._curJadeNum = num;
        var myNum = CurrencyHelper.getCurJadeNum();
        var radio = CurrencyHelper.getDiamondExchangeRadio();
        this._textDiamond.string = (''+ (num * radio));
        this._updateTxtJadeColor(num > myNum);
    }
    _onCurrExchange() {
        var myNum = CurrencyHelper.getCurJadeNum();
        if (this._curJadeNum > myNum) {
            var callBackOk = function () {
                var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_JADE2);
                if (!isOpen) {
                    G_Prompt.showTip(Lang.get('currency_diamond_open'));
                    return;
                }
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2);
            }
            UIPopupHelper.popupAlert(Lang.get('common_diamond_title'),Lang.get('common_jade2_not_enough'),callBackOk,null,(pop:PopupAlert)=>{
                pop.setOKBtn(Lang.get('common_vip_func_btn2'));
            })
            return;
        }
        var noTip = UserDataHelper.getPopModuleShow(this.node.name);
        if (!noTip) {
            var radio = CurrencyHelper.getDiamondExchangeRadio();
            var params = {
                moduleName: 'COST_YUBI_MODULE_NAME_11',
                yubiCount: this._curJadeNum,
                itemCount: this._curJadeNum * radio,
                tipType: 2
            };
            UIPopupHelper.popupCostYubiTip(params,handler(this,this.c2sJadeBiExcharge));
            return;
        }
        G_UserData.getVip().c2sJadeBiExcharge(this._curJadeNum);
    }

    private c2sJadeBiExcharge():void{
        G_UserData.getVip().c2sJadeBiExcharge(this._curJadeNum);
    }
    _onEventGetRechargeNotice() {
        this._initJadeView();
        var myNum = CurrencyHelper.getCurJadeNum();
        this._updateTxtJadeColor(this._curJadeNum > myNum);
    }
    _onEventJadeBiExcharge() {
        this._initJadeView();
        this._onNumSelect(1);
        this._onBtnClose();
    }
}