import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import HeroGoldHelper from "./HeroGoldHelper";
import CommonUI from "../../../ui/component/CommonUI";
import { Path } from "../../../utils/Path";
import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

var HERO_NAME_RES = {
    [250]: 'txt_goldhero_cultivate_shu01',
    [450]: 'txt_goldhero_cultivate_qun01',
    [350]: 'txt_goldhero_cultivate_wu01',
    [150]: 'txt_goldhero_cultivate_wei01'
};
var HERO_HEAD_RES = {
    [250]: 'img_gold_cultivate_hero02',
    [450]: 'img_gold_cultivate_hero04',
    [350]: 'img_gold_cultivate_hero03',
    [150]: 'img_gold_cultivate_hero01'
};

@ccclass
export default class HeroGoldMidNode extends cc.Component {
    
    private _callback:any;
    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode2: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHead: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageName: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null; 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTips: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;


    onLoad() {
        this._imageHead.sizeMode = cc.Sprite.SizeMode.RAW;
        this._imageName.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    setInitData(callback) {
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._panelTouchClicked,this);
        this._callback = callback;
        // this._imageHead.ignoreContentAdaptWithSize(true);
        this._playMoving(this._effectNode1, 'moving_jinjiangyangcheng_touxiang');
    }
    _panelTouchClicked() {
        if (this._callback) {
            this._callback();
        }
    }
    updateNode(unitData) {
        var oweCount = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, unitData.getBase_id(), unitData.getId());
        var costInfo = HeroGoldHelper.heroGoldTrainCostInfo(unitData)[0];
        var txt = oweCount + ('/' + costInfo['cost_hero']);
        var iconRes = HeroGoldHelper.getHeroIconRes(unitData.getBase_id());
        UIHelper.loadTexture( this._imageHead, Path.getGoldHero(iconRes));
        if (HeroGoldHelper.heroGoldCanRankUp(unitData)) {
            this._switchUI(true);
            this._playMoving(this._effectNode2, 'moving_jinjiangyangcheng_touxiangkedianji');
        } else {
            this._switchUI(false);
            this._textPercent.string = (txt);
            var nameRes = HeroGoldHelper.getHeroNameRes(unitData.getBase_id());
            UIHelper.loadTexture( this._imageName, Path.getTextLimit(nameRes));
        }
    }
    _playMoving(node:cc.Node, movingName:string) {
        node.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(node, movingName, function (key) {
            if (key == 'touxiang') {
                return this._getHeadIamge();
            }
        }.bind(this),null);
    }
    private _switchUI(_switch:boolean){
        this._imageTips.node.active = (_switch);
        this._effectNode2.active = (_switch);
        this._imageName.node.active = (!_switch);
        this._textPercent.node.active = (!_switch);
    }
    _getHeadIamge():cc.Node{
        var image = (new cc.Node()).addComponent(cc.Sprite);
        return image.node;
    }


}