import PopupBase from "./PopupBase";
import CommonNormalMiniPop from "./component/CommonNormalMiniPop";
import CommonResourceInfo from "./component/CommonResourceInfo";
import CommonButtonLevel0Normal from "./component/CommonButtonLevel0Normal";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import { Lang } from "../lang/Lang";
import { handler } from "../utils/handler";
import { Colors, G_SignalManager, G_Prompt, G_UserData } from "../init";
import { SignalConst } from "../const/SignalConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import UIHelper from "../utils/UIHelper";
import { Path } from "../utils/Path";
import { stringUtil } from "../utils/StringUtil";
import { PopupGetRewards } from "./PopupGetRewards";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupGiftCode extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _popBG: CommonNormalMiniPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInput: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHint: cc.Label = null;
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

    @property({
        type: cc.EditBox,
        visible: true
    })
    _nameText: cc.EditBox = null;
    _signalGiftCodeReward: any;


    onCreate() {
        this._btnOk.setString(Lang.get('common_btn_name_confirm'));
        this._btnCancel.setString(Lang.get('common_btn_name_cancel'));
        this._popBG.setTitle(Lang.get('gift_code_title'));
        this._popBG.addCloseEventListener(handler(this, this._onClickClose));
        this._btnOk.addClickEventListenerEx(handler(this, this.onButton));
        this._btnCancel.addClickEventListenerEx(handler(this, this._onCancelButton));
        let param: any = {
            bgPanel: this._imageInput,
            fontSize: 20,
            placeholderFontColor: Colors.INPUT_PLACEHOLDER,
            fontColor: Colors.BRIGHT_BG_ONE,
        }

        param.fontSize = param.fontSize || 22;
        param.fontColor = param.fontColor || Colors.BRIGHT_BG_ONE;
        param.placeholder = param.placeholder || '';
        param.placeholderFontColor = param.placeholderFontColor || Colors.INPUT_PLACEHOLDER;
        param.placeholderFontSize = param.placeholderFontSize || param.fontSize;
        param.inputMode = param.inputMode || cc.EditBox.InputMode.SINGLE_LINE;
        param.inputFlag = param.inputFlag || cc.EditBox.InputFlag.SENSITIVE;
        param.returnType = param.returnType || 1;
        param.maxLength = param.maxLength || 7;
        param.maxLenTip = param.maxLenTip;
        var contentSize = param.bgPanel.node.getContentSize();
        UIHelper.loadTexture(this._nameText.background, Path.getUICommon('input_bg'));
        // this._nameText.setCascadeOpacityEnabled(true);
        this._nameText.textLabel.useSystemFont = true;
        this._nameText.textLabel.fontFamily = (Path.getCommonFont());
        this._nameText.textLabel.fontSize = (param.fontSize);
        this._nameText.placeholderLabel.useSystemFont = true;
        this._nameText.placeholderLabel.fontFamily = (param.placeholder);
        this._nameText.placeholderLabel.node.color = (param.placeholderFontColor);
        this._nameText.placeholderLabel.fontSize = (param.placeholderFontSize);
        this._nameText.fontColor = (param.fontColor);
        this._nameText.inputMode = (param.inputMode);
        this._nameText.inputFlag = (param.inputFlag);
        this._nameText.returnType = (param.returnType);
        this._nameText.maxLength = (18);
    }
    onEnter() {
        this._signalGiftCodeReward = G_SignalManager.add(SignalConst.EVENT_GIFT_CODE_REWARD, handler(this, this._onEventGiftCodeReward));
    }
    onExit() {
        this._signalGiftCodeReward.remove();
        this._signalGiftCodeReward = null;
    }
    _onEventGiftCodeReward(event, message) {
        this._onShowRewardItems(message);
        this.close();
    }
    onButton() {
        var code = this._nameText.textLabel.string;
        code = stringUtil.trim(code);
        if (code == '') {
            G_Prompt.showTip(Lang.get('gift_code_input_placeholder'));
            return;
        }
        G_UserData.getBase().c2sGetGameGiftBag(code);
    }
    _onCancelButton() {
        this.close();
    }
    _onShowRewardItems(message) {
        var awards = message['awards'];
        if (awards) {
            if (!(awards.length == 1 && TypeConvertHelper.getTypeClass(awards[0].type) == null)) {
                PopupGetRewards.showRewards(awards);
            }
            G_Prompt.showTip(Lang.get('exchange_success'));
        }
    }
    _onClickClose() {
        this.close();
    }
}