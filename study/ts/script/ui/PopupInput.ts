import PopupBase from "./PopupBase";
import CommonNormalMiniPop from "./component/CommonNormalMiniPop";
import CommonButtonLevel0Normal from "./component/CommonButtonLevel0Normal";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import UIHelper from "../utils/UIHelper";
import { Lang } from "../lang/Lang";
import { handler } from "../utils/handler";
import InputUtils from "../utils/InputUtils";
import { Colors, G_SignalManager, G_Prompt } from "../init";
import { SignalConst } from "../const/SignalConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupInput extends PopupBase{

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _popBG: CommonNormalMiniPop = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHint: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInput: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOk: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab)
    CommonEditBox:cc.Prefab = null;

    _okCallback: any;
    _cancelCallback: any;
    _title: string;
    _hint: string;
    _tip: string;
    _placeholderStr: string;
    _maxLength: number;
    _maxLenTip: string;
    _editBox: cc.EditBox;
    _signalPopupClose: any;

    ctor(okCallback, cancelCallback, title, hint, tip, placeholderStr, maxLength?, maxLenTip?) {
        this._okCallback = okCallback;
        this._cancelCallback = cancelCallback;
        this._title = title;
        this._hint = hint;
        this._tip = tip;
        this._placeholderStr = placeholderStr;
        this._maxLength = maxLength || 28;
        this._maxLenTip = maxLenTip;
    }
    onCreate() {

        UIHelper.addEventListener(this.node, this._btnCancel._button, 'PopupInput', '_onClickCancelButton');
        UIHelper.addEventListener(this.node, this._btnOk._button, 'PopupInput', '_onClickOkButton');

        this._btnCancel.setString(Lang.get('common_btn_name_cancel'));
        this._btnOk.setString(Lang.get('common_btn_name_confirm'));
        this._popBG.setTitle(this._title || Lang.get('account_verify_code_title'));
        this._popBG.addCloseEventListener(handler(this, this._onClickCancelButton));
        this._textHint.string = (this._hint || Lang.get('account_verify_code_hint'));
        this._editBox = InputUtils.createInputView({
            bgPanel: this._imageInput.node,
            fontSize: 22,
            fontColor: Colors.BRIGHT_BG_ONE,
            placeholderFontColor: Colors.INPUT_PLACEHOLDER,
            maxLength: this._maxLength,
            placeholder: this._placeholderStr || Lang.get('account_verify_code_input_placeholder'),
            maxLenTip: this._maxLenTip
        });
    }
    onEnter() {
        this._signalPopupClose = G_SignalManager.add(SignalConst.EVENTT_POPUP_CLOSE, handler(this, this._onEventPopupClose));
    }
    onExit() {
        this._signalPopupClose.remove();
        this._signalPopupClose = null;
    }
    _onEventPopupClose(event) {
        this.close();
    }
    _onClickCancelButton() {
        if (this._cancelCallback) {
            this._cancelCallback();
        }
        this.close();
    }
    setBtnOkName(name) {
        if (this._btnOk && name) {
            this._btnOk.setString(name);
        }
    }
    onlyShowOkButton() {
        var posX = this._popBG.node.x;
        this._btnCancel.setVisible(false);
        this._btnOk.node.x = (posX);
    }
    _onClickOkButton() {
        var code = this._editBox.string;
        code.trim();
        if (code == '') {
            G_Prompt.showTip(this._tip || Lang.get('account_verify_code_input_placeholder'));
            return;
        }
        var isBreak = null;
        if (this._okCallback) {
            isBreak = this._okCallback(code);
        }
        if (!isBreak) {
            this.close();
        }
    }
    _onClickClose() {
        this.close();
    }
}
