const { ccclass, property } = cc._decorator;

import CommonTopbarItemList from './CommonTopbarItemList'

import CommonButtonBackHome from './CommonButtonBackHome'

import CommonButtonBack from './CommonButtonBack'
import { G_ResolutionManager, G_SceneManager, G_EffectGfxMgr } from '../../init';
import UIHelper from '../../utils/UIHelper';
import { Path } from '../../utils/Path';
import { handler } from '../../utils/handler';
import CommonHelp from './CommonHelp';

@ccclass
export default class CommonTopbarBase extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_design: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_left: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_BG_1: cc.Sprite = null;

    @property({
        type: CommonButtonBack,
        visible: true
    })
    _btnBack: CommonButtonBack = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: CommonButtonBackHome,
        visible: true
    })
    _btnHome: CommonButtonBackHome = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_bk: cc.Node = null;

    @property({
        type: CommonTopbarItemList,
        visible: true
    })
    _topBarItemList: CommonTopbarItemList = null;
    _panelBK: any;
    _imageBG1: any;


    private static BG_TYPE_TOTAL = 2
    _callbackOnBack: any;

    private _imageTitleSet: boolean = false;
    @property({
        type: CommonHelp,
        visible: true
    }) _fileHelp: CommonHelp = null;
    onLoad() {
        this._panelBK = this._panel_bk;
        var oldSize = this._panelBK.getContentSize();
        this._panelBK.setContentSize(cc.size(G_ResolutionManager.getDesignWidth(), oldSize.height));

        this._imageBG1 = this._image_BG_1;
        //   this._imageTitle.ignoreContentAdaptWithSize(true);

        this._btnBack.addClickEventListenerEx(handler(this, this.onButtonBack));
        this._btnHome.addClickEventListenerEx(handler(this, this.onButtonBackHome));
        if (this._imageTitleSet == false) {
            this._imageTitle.node.active = (false);
            this._textTitle.node.active = (false);
        }
        this._textTitle.fontSize -= 3;

    }
    updateUI(topBarStyle, isShowPanel?) {
        isShowPanel = isShowPanel || false;
        this._topBarItemList.updateUI(topBarStyle, isShowPanel);
    }
    updateUIByResList(resList, doLayout?) {
        this._topBarItemList.updateUIByResList(resList);
    }
    hideBG() {
    }
    setTitle(s, size?, color?, outline?) {
        this._imageTitleSet = true;
        this._textTitle.string = (s);
        this._imageTitle.node.active = false;
        this._textTitle.node.active = (true);
        if (size) {
            this._textTitle.fontSize = (size);
        }
        if (color) {
            this._textTitle.node.color = (color);
        }
        if (outline) {
            UIHelper.enableOutline(this._textTitle, outline, 1);
        }
    }
    setImageTitle(imgName) {
        this._imageTitleSet = true;
        var imgPath = Path.getTextSystemBigTab(imgName);
        UIHelper.loadTexture(this._imageTitle, imgPath);
        this._imageTitle.node.active = (true);
        this._textTitle.node.active = (false);
    }
    setCallBackOnBack(callback) {
        this._callbackOnBack = callback;
    }
    onButtonBack() {
        if (this._callbackOnBack) {
            this._callbackOnBack();
        } else {
            G_SceneManager.popScene();
        }
    }
    onButtonBackHome() {
        G_SceneManager.popToRootScene();
    }
    setItemListVisible(visible) {
        if (visible == null) {
            visible = false;
        }
        this._topBarItemList.node.active = (visible);
    }
    setBGType(type) {
        if (1 == type) {
            this['_image_BG_' + 1].node.active = (true);
        } else {
            this['_image_BG_' + 1].node.active = (false);
        }
    }
    pauseUpdate() {
        this._topBarItemList.pauseUpdate();
    }
    resumeUpdate() {
        this._topBarItemList.resumeUpdate();
    }
    setItemListPosX(posX) {
        this._topBarItemList.node.x = (posX);
    }
    playEnterEffect() {
        G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_shangdian_top', null, null, null);
    }
    hideBack() {
        this._btnBack.node.active = (false);
    }
    updateHelpUI(functionId, param?) {
        this._fileHelp.updateUI(functionId, param);
        this._fileHelp.node.active = (true);
    }
}