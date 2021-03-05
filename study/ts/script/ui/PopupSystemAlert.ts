const { ccclass, property } = cc._decorator;

import PopupBase from "./PopupBase";
import UIHelper from "../utils/UIHelper";
import CommonResourceInfo from './component/CommonResourceInfo'
import CommonButtonLevel0Normal from './component/CommonButtonLevel0Normal'
import CommonButtonLevel0Highlight from './component/CommonButtonLevel0Highlight'
import CommonNormalMiniPop from './component/CommonNormalMiniPop'
import { Lang } from "../lang/Lang";
import { handler } from "../utils/handler";
import { RichTextExtend } from "../extends/RichTextExtend";
import { UserDataHelper } from "../utils/data/UserDataHelper";

@ccclass
export default class PopupSystemAlert extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _popBG: CommonNormalMiniPop = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _descBG: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOk: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnGo: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox: cc.Toggle = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _costResInfo2: CommonResourceInfo = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemNoShow: cc.Label = null;

    private _title;
    private _content;
    private _callbackOK;
    private _callbackCancel;
    private _callbackClose;
    private _textDesc: cc.RichText;
    private _moduleName;
    private _isInit;
    _callbackCheckeBox: any;

    setup(title, content, callbackOK?, callbackCancel?, isClickOtherClose?, isNotCreateShade?) {
        this._title = title;
        this._content = content;
        this._callbackOK = callbackOK;
        this._callbackCancel = callbackCancel;
        isClickOtherClose = isClickOtherClose != null ? isClickOtherClose : true;
        this._callbackCheckeBox = null;
        this.setClickOtherClose(isClickOtherClose);
        this.start();
    }

    start() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        this._popBG.setTitle(this._title || Lang.get('common_title_notice'));
        this._popBG.hideCloseBtn();
        this._popBG.addCloseEventListener(handler(this, this.onButtonClose));
        this._btnOk.addClickEventListenerExDelay(handler(this, this.onButtonOK), 0.1);
        this._btnGo.addClickEventListenerEx(handler(this, this.onButtonOK));
        this._btnCancel.addClickEventListenerExDelay(handler(this, this.onButtonCancel), 0.1);
        this._listView.active = (false);
        this._btnOk.setString(Lang.get('common_btn_sure'));
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this._checkBox.node.on(cc.Node.EventType.TOUCH_END, this.onBtnCheckBox, this);
        this._checkBox.isChecked = false;
        var size = this._descBG.getContentSize();
        // var sizeTemp = cc.size(size.width, 150);
        if (this._content) {
            this._textDesc = RichTextExtend.createWithContent(this._content);
            this._textDesc.node.setAnchorPoint(0.5, 0.5);
            // this._textDesc.setVerticalSpace(10);
            //   if (this._textDesc.node.width > size.width) {
            this._textDesc.maxWidth = size.width+10;
            //  }
            this._textDesc.lineHeight = 30;
            this._textDesc.horizontalAlign = cc.macro.TextAlignment.CENTER;
            // this._textDesc.ignoreContentAdaptWithSize(false);
            // this._textDesc.node.setPosition(size.width * 0.5, size.height * 0.5);
            this._descBG.addChild(this._textDesc.node);
        }
    }

    setContentWithRichTextType2(content, defaultColor, fontSize, YGap, alignment) {
        if (this._textDesc) {
            this._textDesc.node.active = (false);
        }
        var richText = UIHelper.createMultiAutoCenterRichText(content, defaultColor, fontSize, YGap, alignment, 200);
        var size = this._descBG.getContentSize();
        richText.setAnchorPoint(0.5, 0.5);
        //   richText.setPosition(size.width * 0.5, size.height * 0.5);
        this._descBG.addChild(richText);
    }
    setContentWithRichTextType3(content, defaultColor, fontSize, YGap) {
        if (this._textDesc) {
            this._textDesc.node.active = (false);
        }
        var richtext = RichTextExtend.createRichTextByFormatString2(content, defaultColor, fontSize);
        // richtext.ignoreContentAdaptWithSize(false);
        // richtext.setVerticalSpace(YGap);
        richtext.node.setContentSize(450, 0);
        richtext.node.setAnchorPoint(0.5, 0.5); // 先设Content后设Anchor，2dx中用了ignoreContentAdaptWithSize;
        // richtext.formatText();
        var size = this._descBG.getContentSize();
        if (richtext.node.width > size.width) {
            richtext.maxWidth = size.width;
        }
        //    richtext.node.setPosition(size.width * 0.5, size.height * 0.5);
        this._descBG.addChild(richtext.node);
    }
    setBtnOk(okName) {
        this._btnOk.setString(okName);
    }
    setBtnCancel(cancelName) {
        this._btnCancel.setString(cancelName);
    }
    showGoButton(goName) {
        this._btnOk.setVisible(false);
        this._btnCancel.setVisible(false);
        this._btnGo.setVisible(true);
        if (goName) {
            this._btnGo.setString(goName);
        }
    }
    onButtonClose() {
        if (this._callbackClose) {
            this._callbackClose();
            this.close();
        } else {
            this.onButtonCancel();
        }
    }
    onButtonOK() {
        this._updateCheckBox();
        if (this._callbackOK) {
            this._callbackOK();
        }
        this.close();
    }
    onButtonCancel() {
        if (this._callbackCancel) {
            this._callbackCancel();
        }
        this.close();
    }
    setCloseCallback(callbackClose) {
        this._callbackClose = callbackClose;
    }
    setCloseVisible(needShow) {
        this._popBG.setCloseVisible(needShow);
    }
    setCheckBoxCallback(callback) {
        this._callbackCheckeBox = callback;
    }
    onBtnCheckBox() {
        // this._isCheck = this._checkBox.isChecked;
        this.scheduleOnce(() => {
            var isCheck = this._checkBox.isChecked;
            if (this._callbackCheckeBox) {
                this._callbackCheckeBox(isCheck);
            }
        }, 0)

    }
    _updateCheckBox() {
        if (this._moduleName && this._moduleName != '') {
            // dump(this._moduleName);
            // dump(isCheck);
            UserDataHelper.setPopModuleShow(this._moduleName, this._checkBox.isChecked);
        }
    }
    onButtonGo(sender) {
        if (this._callbackOK) {
            this._callbackOK();
        }
        this.close();
    }
    setCheckBoxVisible(visible) {
        this._checkBox.node.active = (visible);
        this._itemNoShow.node.active = (visible);
    }
    setModuleName(moduleDataName) {
        this._moduleName = moduleDataName;
    }
    addRichTextList(paramList) {
        // for (i in paramList) {
        //     var value = paramList[i];
        //     var node = ccui.Widget.create();
        //     node.setAnchorPoint(0, 0);
        //     var richText = ccui.RichText.createWithContent(value);
        //     node.setContentSize(cc.size(0, 30));
        //     node.addChild(richText);
        //     richText.setAnchorPoint(0.5, 0);
        //     this._listView.pushBackCustomItem(node);
        // }
        // this._listView.setVisible(true);
        // this._listView.adaptWithContainerSize();
        // var contentSize = this._descBG.getContentSize();
        // this._listView.setPosition(contentSize.width * 0.5, contentSize.height * 0.5);
    }
}