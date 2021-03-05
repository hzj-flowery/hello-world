const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_UserData, G_ServerTime } from '../../../init';
import { handler } from '../../../utils/handler';
import PopupBase from '../../../ui/PopupBase';

@ccclass
export default class PopupSuspendTimeView extends PopupBase {

    @property({ type: CommonNormalMiniPop, visible: true })
    _commonNodeBk: CommonNormalMiniPop = null;

    @property({ type: cc.Node, visible: true })
    _nodeDesc: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _image_time: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textHint: cc.Label = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnBack: CommonButtonLevel0Highlight = null;

    private _oriPositionY;
    private _closeCallBack;
    private _okCallBack;

    public setCustomText(strTitle, strContent, strButton, strContentEnd, offsetY) {
        this._commonNodeBk.setTitle(strTitle);
        this._nodeDesc.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(strContent, {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 22,
            other: { 1: { fontSize: 22 } }
        });
        this._nodeDesc.addChild(richText.node);
        if (strContentEnd != null && strContentEnd != '') {
            var richText2 = RichTextExtend.createRichTextByFormatString(strContentEnd, {
                defaultColor: Colors.BRIGHT_BG_TWO,
                defaultSize: 22,
                other: { 1: { fontSize: 22 } }
            });
            richText2.node.y = richText.node.y - 30;
            this._nodeDesc.addChild(richText2.node);
        }
        if (this._oriPositionY == null) {
            this._oriPositionY = this._nodeDesc.y;
        }
        this._nodeDesc.y = (this._oriPositionY - offsetY);
        this._btnBack.setString(strButton);
    }

    public onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onCloseBack));
        this._btnBack.addClickEventListenerEx(handler(this, this._onBtnBack));
    }

    public onEnter() {
        var suspendTime = G_UserData.getSeasonSport().getSuspendTime();
        if ((G_ServerTime.getLeftSeconds(suspendTime)) > 0) {
            this._textHint.string = G_ServerTime.getLeftSecondsString(suspendTime, '00：00：00');
            this.schedule(handler(this, this._update), 0.5);
        }
        this._image_time.node.active = (G_ServerTime.getLeftSeconds(suspendTime)) > 0;
    }

    public onExit() {
        this.unschedule(handler(this, this._update));
    }

    public setCloseCallBack(closeCallBack) {
        this._closeCallBack = closeCallBack;
    }

    public setOkCallBack(okCallBack) {
        this._okCallBack = okCallBack;
    }

    private _onCloseBack(sender) {
        if (this._closeCallBack) {
            this._closeCallBack();
        }
        this.close();
    }

    private _onBtnBack(sender) {
        if (this._closeCallBack) {
            this._closeCallBack();
        }
        if (this._okCallBack) {
            this._okCallBack();
        }
        this.close();
    }

    private _update(dt) {
        var suspendTime = G_UserData.getSeasonSport().getSuspendTime();
        if (G_ServerTime.getLeftSeconds(suspendTime) > 0) {
            this._textHint.string = G_ServerTime.getLeftSecondsString(suspendTime, '00：00：00');
        } else {
            if (this._closeCallBack) {
                this._closeCallBack();
            }
            this.close();
        }
    }
}