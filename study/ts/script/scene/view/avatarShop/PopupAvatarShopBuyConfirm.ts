const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar'

import CommonNormalSmallMPop from '../../../ui/component/CommonNormalSmallMPop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { G_UserData, Colors, G_ConfigLoader } from '../../../init';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { AvatarConst } from '../../../const/AvatarConst';
import { ShopActiveDataHelper } from '../../../utils/data/ShopActiveDataHelper';
import { Path } from '../../../utils/Path';
import CommonUI from '../../../ui/component/CommonUI';
import { FunctionConst } from '../../../const/FunctionConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupAvatarShopBuyConfirm extends PopupBase {

    @property({
        type: CommonNormalSmallMPop,
        visible: true
    })
    _popupBg: CommonNormalSmallMPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: CommonStoryAvatar,
        visible: true
    })
    _fileNodeDraw: CommonStoryAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameColor: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHeroName: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeCost1: CommonResourceInfo = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox1: cc.Toggle = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeCost2: CommonResourceInfo = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox2: cc.Toggle = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonCancel: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonBuy: CommonButtonLevel0Normal = null;

    private _goodId: number;
    private _callback: any;
    private _selectIndex: number;
    setInitData(goodId: number, callback) {
        this._goodId = goodId;
        this._callback = callback;
    }
    onCreate() {
        this._buttonCancel.addTouchEventListenerEx(handler(this, this._onClickButtonCancel), false);
        this._buttonBuy.addTouchEventListenerEx(handler(this, this._onClickButtonBuy), false)
        this._selectIndex = 1;
        this._popupBg.setTitle(Lang.get('shop_pop_title'));
        this._popupBg.hideBtnBg();
        
        this._buttonCancel.setString(Lang.get('shop_btn_cancel'));

        this._isClickOtherClose = true;
        this._buttonBuy.setString(Lang.get('shop_btn_buy'));
    }

    private addCheckListen1():void{
        this._checkBox1.checkEvents = [];
        var checkE1 = new cc.Component.EventHandler();
        checkE1.component = "PopupAvatarShopBuyConfirm";
        checkE1.target = this.node;
        checkE1.handler = "_onCheckBoxClicked1";
        this._checkBox1.clickEvents.push(checkE1);
    }
    private addCheckListen2():void{
        this._checkBox2.checkEvents = [];
        var checkE2 = new cc.Component.EventHandler();
        checkE2.component = "PopupAvatarShopBuyConfirm";
        checkE2.target = this.node;
        checkE2.handler = "_onCheckBoxClicked2";
        this._checkBox2.clickEvents.push(checkE2);
    }
    onEnter() {
        this._updateView();
        this._selectIndex = 1;
        this._checkBox1.check();
        this._checkBox2.uncheck();
        this.addCheckListen1();
        this.addCheckListen2();
        this.schedule(this.updateCheck,0.1)
    }
    onExit() {
        this.unschedule(this.updateCheck);
    }
    _updateView() {
        var goodId = this._goodId;
        var data = G_UserData.getShopActive().getUnitDataWithId(goodId);
        var info = data.getConfig();
        var avatarId = info.value;
        var avatarInfo = AvatarDataHelper.getAvatarConfig(avatarId);
        var avatarColor = avatarInfo.color;
        var resBg = AvatarConst.color2ImageBg[avatarColor];
        var heroId = avatarInfo.hero_id;
        var resName = AvatarConst.color2NameBg[avatarColor] || 'img_Turnscard_namebg';
        var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
        if (resBg) {
            this._imageBg.node.addComponent(CommonUI).loadTexture(Path.getTurnscard(resBg, '.jpg'));
        }
        this._fileNodeDraw.updateUI(heroId);
        this._imageNameColor.node.addComponent(CommonUI).loadTexture(Path.getTurnscard(resName));
        this._imageHeroName.node.addComponent(CommonUI).loadTexture(Path.getShowHeroName(heroId));
        this._textName.string = (Lang.get('shop_avatar_confirm_name', { name: avatarInfo.name }));
        this._textName.node.color = (Colors.getColor(avatarInfo.color));
        var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_AVATAR);
        this._textDes.string = (Lang.get('shop_avatar_confirm_des', { level: funcLevelInfo.level }));
        for (var i = 1; i <= 2; i++) {
            var cost = costInfo[i - 1];
            if (cost) {
                (this['_nodeCost' + i] as CommonResourceInfo).setVisible(true);
                (this['_nodeCost' + i] as CommonResourceInfo).updateUI(cost.type, cost.value, cost.size);
                (this['_nodeCost' + i] as CommonResourceInfo).showResName(true, Lang.get('shop_avatar_cost_title'));
            } else {
                (this['_nodeCost' + i] as CommonResourceInfo).setVisible(false);
            }
        }
    }
    _onClickButtonCancel() {
        this.close();
    }
    _onClickButtonBuy() {
        if (this._callback) {
            var success = this._callback(this._goodId, this._selectIndex);
            if (success) {
                this.close();
            }
        }
    }
    _onCheckBoxClicked1() {
        this._selectIndex = 1;
    }
    updateCheck(){
        if(this._selectIndex==1)
        {
            this._checkBox2.uncheck();
            this._checkBox1.check();
        }
        else if(this._selectIndex==2)
        {
            this._checkBox1.uncheck();
            this._checkBox2.check();
        }
    }
    _onCheckBoxClicked2() {
        this._selectIndex = 2;
    }


}