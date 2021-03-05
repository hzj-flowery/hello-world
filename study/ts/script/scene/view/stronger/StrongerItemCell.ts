const {ccclass, property} = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'
import { Path } from '../../../utils/Path';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import UIHelper from '../../../utils/UIHelper';


var IMAGE_STATE = {
    1: {
        min: 0,
        max: 40,
        path: Path.getText('txt_zhuangtai01')
    },
    2: {
        min: 40,
        max: 60,
        path: Path.getText('txt_zhuangtai02')
    },
    3: {
        min: 60,
        max: 80,
        path: Path.getText('txt_zhuangtai03')
    },
    4: {
        min: 80,
        max: 100,
        path: Path.getText('txt_zhuangtai04')
    },
    5: {
        min: 100,
        max: 1000,
        path: Path.getText('txt_zhuangtai05')
    }
};

@ccclass
export default class StrongerItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarProgress: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButton: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOpen: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenLevel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;

    @property(cc.Node)
    nodeProgress:cc.Node = null;

    @property(cc.Node)
    nodeOpening:cc.Node = null;

    @property(cc.Sprite)
    imageSign:cc.Sprite = null;

    @property(cc.Sprite)
    imageIcon:cc.Sprite = null;
    
    _itemData: any;

    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onEnter() {
        this._commonButton.setString(Lang.get('lang_stronger_btn_go'));
        this._commonButton.switchToNormal();
        this._commonButton.addClickEventListenerEx(handler(this, this._onCommonButton));
    }
    updateUI(index, data, tabIndex) {
        this._itemData = data;

        //前端做一个限制
        this._itemData.percent = Math.min(data.percent,100);
        this.nodeProgress.active = false;
        this.nodeOpening.active = false;
        if (tabIndex == 1) {
            this.updateTab1();
        } else {
            this.updateTab2();
        }
    }
    updateTab1() {
        this.nodeProgress.active = true;
        this.updateCommonImage();
        this._textItemName.string = (this._itemData.funcData.name);
        this._imageReceive.node.active = (false);
        this._commonButton.setVisible(true);
        this._loadingBarProgress.progress = (this._itemData.percent/100);
        this._textProgress.string = (this._itemData.percent + '%');
        function mathCurrStateImg(percent) {
            for (let i in IMAGE_STATE) {
                var value = IMAGE_STATE[i];
                if (percent >= value.min && percent < value.max) {
                    return value.path;
                }
            }
        }
        UIHelper.loadTexture(this.imageSign, mathCurrStateImg(this._itemData.percent));
    }
    updateTab2() {
        //logWarn('StrongerItemCell:updateTab2');
        this.nodeOpening.active = true;
        this.updateCommonImage();
        this._textItemName.string = (this._itemData.funcData.name);
        this._textOpenDesc.string = (this._itemData.funcData.description);
        this._imageOpen.node.active = (false);
        this._textOpenLevel.node.active = (false);
        var isOpen = this._itemData.isOpen;
        if (isOpen == false) {
            this._textOpenLevel.node.active = (true);
            this._textOpenLevel.string = (Lang.get('lang_stronger_level', { level: this._itemData.funcData.level }));
        } else {
            this._imageOpen.node.active = (true);
        }
    }
    updateCommonImage() {
        UIHelper.loadTextureAutoSize(this.imageIcon, Path.getCommonIcon('main', this._itemData.funcData.icon));
    }
    _onCommonButton() {
        var cfgData = this._itemData.cfgData;
        if (cfgData.function_jump > 0) {
            //dump(cfgData.function_jump);
            WayFuncDataHelper.gotoModuleByFuncId(cfgData.function_jump);
        }
    }
    _updateBtnState(itemData) {
        this._imageReceive.node.active = (false);
        this._commonButton.setEnabled(false);
    }

}
