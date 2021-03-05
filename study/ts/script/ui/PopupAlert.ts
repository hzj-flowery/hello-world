const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from './component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from './component/CommonButtonLevel0Normal'

import CommonNormalMiniPop from './component/CommonNormalMiniPop'
import PopupBase from './PopupBase';
import { handler } from '../utils/handler';
import { Lang } from '../lang/Lang';
import { Path } from '../utils/Path';
import { Colors } from '../init';
import CommonCustomListView from './component/CommonCustomListView';
import UIHelper from '../utils/UIHelper';
import { RichTextExtend } from '../extends/RichTextExtend';
import { TextInputConst } from '../const/TextInputConst';

@ccclass
export default class PopupAlert extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _popupBG: CommonNormalMiniPop = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOK: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _descBG: cc.Node = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;

    private _title: string;
    private _content: string;
    private _callbackOK: any;
    private _callbackCancel: any;
    private _callbackExit: any;
    private _closeCallBack: any;

    private _textDesc: any;

    public static PrefabPath: string = 'prefab/common/PopupAlert';

    init(title, content, callbackOK, callbackCancel?, callbackExit?) {
        this._title = title;
        this._content = content;
        this._callbackOK = callbackOK;
        this._callbackCancel = callbackCancel;
        this._callbackExit = callbackExit;
        this._btnOK.setString(Lang.get('common_btn_sure'));
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this.setClickOtherClose(true);
        this._init();
    }
    _init() {
        this._popupBG.setTitle(this._title || Lang.get('common_title_notice'));
        //this._popupBG.hideCloseBtn();
        //this._popupBG.addCloseEventListener(handler(this, this.onButtonCancel));
        //this._btnOK.addClickEventListenerExDelay(handler(this, this.onButtonOK), 100);
        //this._btnCancel.addClickEventListenerExDelay(handler(this, this.onButtonCancel), 100);
        UIHelper.addEventListener(this.node, this._btnOK._button, 'PopupAlert', 'onButtonOK');
        UIHelper.addEventListener(this.node, this._btnCancel._button, 'PopupAlert', 'onButtonCancel');
        UIHelper.addEventListener(this.node, this._popupBG._btnClose, 'PopupAlert', 'onButtonCancel');
        this._listView.setVisible(false);
        if (this._content.length == 0) {
            return;
        }
        var result = this._content.match(/\[.*\]/);
        let start = null, stop = null;
        // if (result && result.length > 0) {
        //     start = parseInt(result[0]);
        // }
        // if (result && result.length > 1) {
        //     stop = parseInt(result[1]);
        // }
        //logWarn('PopupAlert ______________' + (tostring(start) + ('   ' + (tostring(stop) + ('  ' + string.len(this._content))))));
        if (!result || result.length < 1) {
            var size = this._descBG.getContentSize();
            //logWarn(this._content);
            this._textDesc = UIHelper.createWithTTF(this._content, Path.getCommonFont(), 22);
            var textDesc = this._textDesc as cc.Label;
            textDesc.node.color = (Colors.SEASON_SILKUNLOCKCONTENT_TEXT);
            textDesc.node.width = (size.width);
            textDesc.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            //this._textDesc.setLineBreakWithoutSpace(true);
            //textDesc.node.setAnchorPoint(0.5,0.5);
            //textDesc.node.setPosition(size.width * 0.5, size.height * 0.5);
            textDesc.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            textDesc.node.width = this._descBG.width;
            this._descBG.addChild(textDesc.node);
            // this._textDesc.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            // this._textDesc.setLineSpacing(10);
        } else {
            var size = this._descBG.getContentSize();
            var sizeTemp = cc.size(size.width, 0);
            this._textDesc = RichTextExtend.createWithContent(this._content);
            this._textDesc.node.setAnchorPoint(cc.v2(0.5, 0.5));
            this._textDesc.maxWidth = size.width;
            //this._textDesc.ignoreContentAdaptWithSize(false);
            //this._textDesc.setVerticalSpace(10);
            this._textDesc.node.setPosition(0, 0);
            this._descBG.addChild(this._textDesc.node);
        }
    }

    onlyShowOkButton() {
        var posX = this._popupBG.node.x;
        this._btnCancel.setVisible(false);
        this._btnOK.node.x = (posX);
    }

    onButtonOK() {
        var isBreak = null;
        if (this._closeCallBack) {
            this._closeCallBack();
        }
        if (this._callbackOK) {
            isBreak = this._callbackOK();
        }
        if (!isBreak) {
            this.close();
        }
    }
    setCloseVisible(needShow) {
        this._popupBG.setCloseVisible(needShow);
    }
    onButtonCancel() {
        if (this._closeCallBack) {
            this._closeCallBack();
        }
        if (this._callbackCancel) {
            this._callbackCancel();
        }
        this.close();
    }

    setCloseCallBack(callback) {
        this._closeCallBack = callback;
    }
    setOKBtn(str) {
        this._btnOK.setString(str);
    }
    setBtnStr(str, str2) {
        this._btnOK.setString(str);
        this._btnCancel.setString(str2);
    }
    onClose() {
        if (this._closeCallBack) {
            this._closeCallBack();
        }
        if (this._callbackExit) {
            this._callbackExit();
        }
    }
    addRichTextList(paramList) {
        for (var i = 0; i < paramList.length; i++) {
            var value = paramList[i];
            var node = new cc.Node();
            node.setAnchorPoint(cc.v2(0, 0));
            let richText = RichTextExtend.createWithContent(value);
            node.setContentSize(cc.size(0, 30));

            node.addChild(richText.node);
            richText.node.setAnchorPoint(cc.v2(0.5, 0));
            this._listView.pushBackCustomItem(node);
        }
        this._listView.setVisible(true);
        this._listView.node.setContentSize(this._listView.content.getContentSize());
        //this._listView.adaptWithContainerSize();
        // var contentSize = this._descBG.getContentSize();
        // this._listView.node.setPosition(cc.v2(contentSize.width * 0.5, contentSize.height * 0.5));
    }
    addRichTextType2(content, defaultColor, fontSize, YGap?, alignment?) {
        //var richText = UIHelper.newRichText(content, defaultColor, fontSize);
        var richText = UIHelper.createMultiAutoCenterRichText(content, defaultColor, fontSize, YGap, alignment);
        var size = this._descBG.getContentSize();
        richText.setAnchorPoint(cc.v2(0.5, 0.5));
        richText.setPosition(-richText.width * 0.5, -richText.height * 0.5);
        this._descBG.addChild(richText);
    }

    addRicheTextChild(richText: cc.RichText) {
        richText.node.setAnchorPoint(cc.v2(0.5, 0.5));
        richText.maxWidth = this._descBG.width;
        richText.node.setPosition(0, 0);
        this._descBG.addChild(richText.node);
    }
}
