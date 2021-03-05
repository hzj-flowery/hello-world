import CommonIconBase from "./CommonIconBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Path } from "../../utils/Path";
import { ComponentIconHelper } from "./ComponentIconHelper";
import UIHelper from "../../utils/UIHelper";
import { assert } from "../../utils/GlobleFunc";
import PopupInstrumentDetail from "../../scene/view/instrument/PopupInstrumentDetail";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import PopupTreasureDetail from "../../scene/view/treasureDetail/PopupTreasureDetail";
import PopupEquipDetail from "../../scene/view/equipmentDetail/PopupEquipDetail";
import PopupBase from "../PopupBase";
import { PopupPropInfo } from "../PopupPropInfo";
import PopupPetDetail from "../../scene/view/pet/PopupPetDetail";
import PopupHorseDetail from "../../scene/view/horseDetail/PopupHorseDetail";
import { G_SceneManager } from "../../init";
import PopupHorseEquipDetail from "../../scene/view/horseEquipDetail/PopupHorseEquipDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonFragmentIcon extends CommonIconBase {
    _imageIconfragment: any;
    _imageItemTop;

    constructor() {
        super();
        this._type = TypeConvertHelper.TYPE_FRAGMENT;
    }

    onLoad() {
        super.onLoad();
        this.showTopImage(false);
    }
    updateUI(value, size, rank) {
        this._imageIcon.sizeMode = cc.Sprite.SizeMode.RAW;
        var itemParams = super.updateUI(value, size, rank);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showFragment(true);
    }
    showFragment(needShow) {
        if (needShow == null) {
            needShow = false;
        }
        var FRAGMENT_ICON_PATH = Path.getTextSignet('img_com_debris01');
        if (this._imageIconfragment == null) {
            var params = {
                name: '_imageIconfragment',
                texture: FRAGMENT_ICON_PATH,
                adaptWithSize: true
            };
            ComponentIconHelper._setPostion(params, 'leftBottom');
            var uiWidget = UIHelper.createImage(params);
            uiWidget.setPosition(uiWidget.x - 5, uiWidget.y - 5);
            this.appendUI(uiWidget);
            this._imageIconfragment = uiWidget;
        }
        this._imageIconfragment.active = (needShow);
    }
    setTopImage(imgPath) {
        if (imgPath == null || imgPath == '') {
            console.error('image path must not be empty~~');
            return;
        }
        if (this._imageItemTop == null) {
            var params = {
                name: '_imageItemTop',
                texture: imgPath
            };
            ComponentIconHelper._setPostion(params, 'leftTop2');
            var uiWidget = UIHelper.createImage(params);
            uiWidget.setScale(0.75);
            this.appendUI(uiWidget);
            this._imageItemTop = uiWidget;
        }
        UIHelper.loadTexture(this._imageItemTop.getComponent(cc.Sprite), imgPath);
    }
    showTopImage(show) {
        if (show == null) {
            show = false;
        }
        if (this._imageItemTop) {
            this._imageItemTop.active = (show);
        }
    }
    _onShowPopupDetail() {
        var conf = this._itemParams.cfg;
        if (conf.comp_type == 1) {
            // var PopupHeroDetail = new (require('PopupHeroDetail'))(TypeConvertHelper.TYPE_HERO, conf.comp_value);
            // PopupHeroDetail.openWithAction();
            UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO,conf.comp_value)
        } else if (conf.comp_type == 2) {
            PopupEquipDetail.getIns(PopupEquipDetail, (p: PopupEquipDetail) => {
                p.ctor(TypeConvertHelper.TYPE_EQUIPMENT, conf.comp_value);
                p.openWithAction();
            })
            //  var PopupEquipDetail = new (require('PopupEquipDetail'))();
            //   PopupEquipDetail.openWithAction();
        } else if (conf.comp_type == 3) {
            PopupTreasureDetail.loadCommonPrefab("PopupTreasureDetail", (popup: PopupTreasureDetail) => {
                popup.initData(TypeConvertHelper.TYPE_FRAGMENT, conf.id);
                popup.openWithAction();
            })
        } else if (conf.comp_type == 4) {
            PopupInstrumentDetail.getIns(PopupInstrumentDetail, (p: PopupInstrumentDetail) => {
                p.init(TypeConvertHelper.TYPE_FRAGMENT, conf.id);
                p.openWithAction();
            });
        } else if (conf.comp_type == 8) {
            PopupBase.loadCommonPrefab('PopupPropInfo', (popup:PopupPropInfo)=>{
                popup.ctor(conf.id, true);
                popup.openWithAction();
            });
        } else if (conf.comp_type == 10) {
            PopupBase.loadCommonPrefab('PopupPetDetail',(popup:PopupPetDetail)=>{
                popup.ctor(TypeConvertHelper.TYPE_PET, conf.comp_value);
                popup.openWithAction();
            });
        } else if (conf.comp_type == 12) {
            G_SceneManager.openPopup(Path.getPrefab("PopupHorseDetail","horse"),(popup:PopupHorseDetail)=>{
                popup.ctor(TypeConvertHelper.TYPE_HORSE, conf.comp_value);
                popup.openWithAction();
            });
        } else if (conf.comp_type == 15) {
            G_SceneManager.openPopup(Path.getPrefab("PopupHorseEquipDetail","horse"),(popup:PopupHorseEquipDetail)=>{
                popup.init(TypeConvertHelper.TYPE_HORSE_EQUIP, conf.comp_value);
                popup.openWithAction();
            });
        }
    }
    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            this._onShowPopupDetail();
        }
    }
}
