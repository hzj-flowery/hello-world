const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_UserData, Colors } from '../../../init';
import BlackList from '../../../utils/BlackList';
import InputUtils from '../../../utils/InputUtils';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupGuildAnnouncement extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _panelBg: CommonNormalMiniPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTextBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMessage: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonCancel: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonSave: CommonButtonLevel0Highlight = null;

    public static readonly MAX_COUNT = 50;
    _maxInputLength: number;
    _textInputType: any;
    _placeholderTxt: string;
    _onClick: Function;
    _contentText: cc.EditBox;

    initData(onClick) {
        this._maxInputLength = PopupGuildAnnouncement.MAX_COUNT;
        this._textInputType = null;
        this._placeholderTxt = Lang.get('guild_input_placeholder');
        this.setOnClickListener(onClick);
    }

    onCreate() {
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        this._buttonCancel.setString(Lang.get('guild_btn_create_cancel'));
        this._buttonSave.setString(Lang.get('guild_btn_create_save'));
        this._createInput();
    }
    setOnClickListener(onClick) {
        this._onClick = onClick;
    }
    setInputLength(length) {
        this._maxInputLength = length;
    }
    setPlaceHolderTxt(txt) {
        this._placeholderTxt = txt;
    }
    setTextInputType(inputType) {
        this._textInputType = inputType;
    }
    _createInput() {
        this._contentText = InputUtils.createInputView({
            bgPanel: this._textMessage.node,
            fontSize: 20,
            maxLength: this._maxInputLength,
            inputEvent: handler(this, this._onInputContent)
        });
        this._contentText.node.opacity = 0;
        var txt = G_UserData.getTextInput().getLastTextInputByType(this._textInputType);
        if (txt) {
            this._contentText.string = (txt);
        }
    }
    onEnter() {
        this._updateContent();
        this._updateTip();
    }
    onExit() {
    }
    setTitle(title) {
        this._panelBg.setTitle(title);
    }
    setContent(content) {
        this._contentText.string = (content);
        this._contentText.textLabel.string = content;
        this._updateContent();
        this._updateTip();
    }
    onButtonCancel() {
        this.close();
    }
    onButtonSave() {
        var content = this._contentText.string;
        content = BlackList.filterBlack(content);
        if (this._onClick) {
            var isDeal = this._onClick(content);
            if (isDeal == false) {
                return;
            }
            G_UserData.getTextInput().clearLastTextInputByType(this._textInputType);
            this.close();
        }
    }
    _onClickClose() {
        var content = this._contentText.string;
        G_UserData.getTextInput().setLastTextInputByType(this._textInputType, content);
        this.close();
    }
    _onInputContent(strEventName, pSender) {
        var edit = pSender;
        var strFmt;
        if (strEventName == 'editing-did-began') {
            this._textMessage.node.opacity = 0;
        } else if (strEventName == 'editing-did-ended') {
            this._textMessage.node.opacity = 255;
            this._updateContent();
            this._updateTip();
        } else if (strEventName == 'editing-return') {
        } else if (strEventName == 'text-changed') {
            this._updateContent();
            this._updateTip();
        }
    }
    _updateContent() {
        var text = this._contentText.string;
        if (!text || text == '') {
            this._textMessage.string = (this._placeholderTxt);
            this._textMessage.node.color = (Colors.INPUT_PLACEHOLDER);
        } else {
            this._textMessage.string = (text);
            this._textMessage.node.color = (Colors.LIST_TEXT);
        }
    }
    _updateTip() {
        var text = this._contentText.string;
        text = text.trim();
        var len = text.length;
        var lastCount = this._maxInputLength - len;
        this._textTip.string = (Lang.get('guild_announcement_tip', { count: lastCount }));
    }

}