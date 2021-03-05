import PopupBase from "../../../ui/PopupBase";
import CommonButton from "../../../ui/component/CommonButton";
import CommonButtonLevel2Normal from "../../../ui/component/CommonButtonLevel2Normal";
import { handler } from "../../../utils/handler";
import { G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { FunctionConst } from "../../../const/FunctionConst";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupWxService extends PopupBase {
    public static path = 'wxService/PopupWxService';

    @property({
        type: CommonButton,
        visible: true
    })
    _btnClose: CommonButton = null;

    @property({
        type: CommonButtonLevel2Normal,
        visible: true
    })
    _btnOK: CommonButtonLevel2Normal = null;

    onCreate() {
        cc.sys.localStorage.setItem("hasOpenWxService", 1)
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WX_SERVICE);
        this._btnClose.addClickEventListenerEx(handler(this, this.close));
        this._btnOK.addClickEventListenerEx(handler(this, this.onOKClick))
    }

    onOKClick() {
        wx.openCustomerServiceConversation({
            showMessageCard: true,
            sendMessageTitle: "我要领加群礼包",
            sendMessageImg: "wxlocal/addQQ.png",
            sendMessagePath: "customer_service/index",
        });
    }
}