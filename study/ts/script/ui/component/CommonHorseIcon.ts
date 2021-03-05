import HorseConst from "../../const/HorseConst";
import EffectGfxNode from "../../effect/EffectGfxNode";
import { G_EffectGfxMgr } from "../../init";
import PopupHorseDetail from "../../scene/view/horseDetail/PopupHorseDetail";
import { HorseDataHelper } from "../../utils/data/HorseDataHelper";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import PopupBase from "../PopupBase";
import CommonIconBase from "./CommonIconBase";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHorseIcon extends CommonIconBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageEquipBrief: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgBrief_1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgBrief_2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgBrief_3: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;

    private _effect1: EffectGfxNode;
    private _effect2: EffectGfxNode;
    private _imgBriefList: cc.Sprite[];
    onLoad() {
        if (this._hasLoad) return;
        super.onLoad();
        this._type = TypeConvertHelper.TYPE_HORSE;

        this._nodeEffectDown = this._nodeEffectDown || this.node.getChildByName('NodeEffectDown');
        this._nodeEffectUp = this._nodeEffectUp || this.node.getChildByName('NodeEffectUp');

        this._imageEquipBrief = this._imageEquipBrief || this.node.getChildByName('ImageEquipBrief').getComponent(cc.Sprite);
        this._imgBrief_1 = this._imgBrief_1 || this._imageEquipBrief.node.getChildByName('imgBrief_1').getComponent(cc.Sprite);
        this._imgBrief_2 = this._imgBrief_2 || this._imageEquipBrief.node.getChildByName('imgBrief_2').getComponent(cc.Sprite);
        this._imgBrief_3 = this._imgBrief_3 || this._imageEquipBrief.node.getChildByName('imgBrief_3').getComponent(cc.Sprite);

        this._init();
    }
    _init() {
        //this.setTouchEnabled(false);
        this._initEquipBrief(this.node);
    }
    updateUI(value, size?) {
        var itemParams = super.updateUI(value, size);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showIconEffect();
        return itemParams;
    }
    _onTouchCallBack(event, customEventData) {
        if (this._callback) {
            this._callback(this, this._itemParams);
        } else {
            var id = this._itemParams.cfg.id;
            PopupBase.loadCommonPrefab('PopupHorseDetail', (popup: PopupHorseDetail) => {
                popup.ctor(TypeConvertHelper.TYPE_HORSE, id);
                popup.openWithAction();
            });
        }
    }
    removeLightEffect() {
        if (this._effect1) {
            this._effect1.node.runAction(cc.destroySelf());
            this._effect1 = null;
        }
        if (this._effect2) {
            this._effect2.node.runAction(cc.destroySelf());
            this._effect2 = null;
        }
    }
    showIconEffect(scale?) {
        this.removeLightEffect();
        if (this._itemParams == null) {
            return;
        }
        var baseId = this._itemParams.cfg.id;
        var effects = HorseDataHelper.getEffectWithBaseId(baseId);
        if (effects == null) {
            return;
        }
        if (this._nodeEffectUp == null) {
            this._nodeEffectUp = this.node.getChildByName('NodeEffectUp');
        }
        if (effects.length == 1) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName);
        }
        if (effects.length == 2) {
            var effectName1 = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName1);
            var effectName2 = effects[1];
            this._effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName2);
        }
    }
    _initEquipBrief(target) {
        this._imgBriefList = [];
        for (var i = 1; i <= HorseConst.HORSE_EQUIP_TYPE_NUM; i++) {
            var imgBrief = this['_imgBrief_' + i];
            this._imgBriefList.push(imgBrief);
        }
    }
    setEquipBriefVisible(visible) {
        this._imageEquipBrief.node.active = (visible);
    }
    updateEquipBriefBg(horseLevel) {
        var texture = null;
        if (horseLevel >= 5) {
            texture = Path.getHorseImg('img_horse03');
        }
        else if (horseLevel == 4) {
            texture = Path.getHorseImg('img_horse02');
        }
        else if (horseLevel == 3) {
            texture = Path.getHorseImg('img_horse01');
        }
        this._imageEquipBrief.node.addComponent(CommonUI).loadTexture(texture);
    }
    updateEquipBriefIcon(stateList) {
        for (var i in stateList) {
            var level = stateList[i];
            let img: cc.Sprite = this._imgBriefList[i]
            if (level == 0) {
                img.node.active = (false);
            } else {
                img.node.active = (true);
                var texture = Path.getHorseImg('img_horse0' + level);
                UIHelper.loadTexture(img, texture);
            }
        }
    }

}