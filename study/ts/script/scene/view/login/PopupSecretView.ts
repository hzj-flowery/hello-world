const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { AgreementSetting } from '../../../data/AgreementSetting';
import { Colors, G_SignalManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { ResourceData } from '../../../utils/resource/ResourceLoader';

@ccclass
export default class PopupSecretView extends PopupBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _popupBG: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnCancle: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnAgree: cc.Button = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewWords: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textWords: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewSecret: cc.ScrollView = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textSecret: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textQianYan: cc.Label = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _tabGourp: CommonTabGroup = null;

    protected preloadResList: ResourceData[] = [
        { path: "secret/AccountAgreement", type: cc.TextAsset },
        { path: "secret/SecretAgreement", type: cc.TextAsset },
    ];

    private _callback;
    private _currSelectIndex;
    private _pageDataList;
    private _strAccountWords;

    private _wordsTextSubStrs: string[];
    private _secretTextSubStrs: string[];
    private _isCreateWordsLabel: boolean;
    private _isCreateSecretLabel: boolean;
    private _currentWordsLabelNum: number;
    private _currentSecretLabelNum: number;

    init(callback) {
        this._callback = callback;
        this._currSelectIndex = null;
        this._pageDataList = [];
    }
    onCreate() {
        this.initListViewWords();
        this._initTab();
    }
    onEnter() {
        this._createWordsLabels();
    }
    onExit() {
        this.unscheduleAllCallbacks();
        this._wordsTextSubStrs = null;
        this._secretTextSubStrs = null;
    }
    _initTab() {
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: 2,
            textList: [
                Lang.get('secretview_title1'),
                Lang.get('secretview_title2')
            ],
            isSwallow: true
        };
        this._tabGourp.setCustomColor([
            [cc.color(87, 85, 85)],
            [cc.color(87, 85, 85)]
        ]);
        this._tabGourp.recreateTabs(param);
    }
    initListViewWords() {
        this._listViewWords.node.active = true;
        this._textWords.node.active = false;
        let res: cc.TextAsset = cc.resources.get("secret/AccountAgreement", cc.TextAsset);
        if (res != null) {
            this._wordsTextSubStrs = res.text.split("\n");
        }

        this._listViewSecret.node.active = false;
        this._textSecret.node.active = false;
        res = cc.resources.get("secret/SecretAgreement", cc.TextAsset);
        if (res != null) {
            this._secretTextSubStrs = res.text.split("\n");
        }
        this._textQianYan.node.color = Colors.COLOR_SECRET_QIANYAN;
    }

    _onTabSelect(index, item) {
        this._listViewWords.node.active = (index == 0);
        this._listViewSecret.node.active = (index == 1);
        if (index == 0) {
            this._createWordsLabels();
        }
        if (index == 1) {
            this._createSecretLabels();
        }
    }

    onButtonAgree() {
        AgreementSetting.saveAgreementIsCheck(true, AgreementSetting.getPrivacyWords());
        AgreementSetting.saveAgreementIsCheck(true, 'check');
        G_SignalManager.dispatch(SignalConst.EVENT_AGREE_SECRET);
        if (this._callback != null) {
            this._callback();
        }
        // G_GameAgent.checkAndLoginGame();
        this.close();
    }
    onButtonCancle() {
        AgreementSetting.saveAgreementIsCheck(false, AgreementSetting.getPrivacyWords());
        AgreementSetting.saveAgreementIsCheck(false, 'check');
        G_SignalManager.dispatch(SignalConst.EVENT_AGREE_SECRET);
        this.closeWithAction();
    }

    private _createWordsLabels() {
        if (this._isCreateWordsLabel) {
            return;
        }
        this._isCreateWordsLabel = true;
        this._currentWordsLabelNum = 0;
        this.schedule(this._updateCreateWorldLabel, 0.02);
    }

    private _updateCreateWorldLabel() {
        for (let i = 0; i < 10; i++) {
            this._createSubStrLabel(this._listViewWords.content, this._wordsTextSubStrs[this._currentWordsLabelNum])
            this._currentWordsLabelNum++;
            if (this._currentWordsLabelNum >= this._wordsTextSubStrs.length) {
                this.unschedule(this._updateCreateWorldLabel);
                return;
            }
        }
    }

    private _createSecretLabels() {
        if (this._isCreateSecretLabel) {
            return;
        }
        this._isCreateSecretLabel = true;
        this._currentSecretLabelNum = 0;
        this.schedule(this._updateCreateSecretLabel, 0.02);
    }

    private _updateCreateSecretLabel() {
        for (let i = 0; i < 10; i++) {
            this._createSubStrLabel(this._listViewSecret.content, this._secretTextSubStrs[this._currentSecretLabelNum])
            this._currentSecretLabelNum++;
            if (this._currentSecretLabelNum >= this._secretTextSubStrs.length) {
                this.unschedule(this._updateCreateSecretLabel);
                return;
            }
        }
    }

    private _createSubStrLabel(parentNode: cc.Node, subStrs: string) {
        let label: cc.Label = new cc.Node().addComponent(cc.Label);
        parentNode.addChild(label.node);
        label.node.width = parentNode.width;
        label.node.color = Colors.COLOR_SECRET_WORDS;
        label.fontSize = 16;
        label.lineHeight = 16;
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.string = subStrs;
    }
}