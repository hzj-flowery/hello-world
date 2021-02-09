import { G_ConfigManager, G_NativeAgent, G_Prompt, G_StorageManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupSuperChargeActivity extends PopupBase {
    @property({ type: cc.Label, visible: true })
    _textIntro: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textQQ: cc.Label = null;
    @property({ type: CommonNormalLargePop, visible: true })
    _popupBG: CommonNormalLargePop = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _buttonAddQQ: CommonButtonLevel0Highlight = null;

    private wxId = 'liy6473';

    onCreate() {
        this._popupBG.setTitle(Lang.get('svip_title'));
        this._popupBG.addCloseEventListener(handler(this, this.close));
        this._textIntro.string = (Lang.get('svip_text_1'));
        this._textQQ.string = this.wxId;
        this._buttonAddQQ.setString(Lang.get('复制微信号'));
        this._buttonAddQQ.addClickEventListenerEx(handler(this, this._onButtonContact))
    }
    _onButtonContact() {
        wx.setClipboardData({
            data: this.wxId,
            success: function (res) {
                G_Prompt.showTip('复制成功');
            }
        });
    }
}