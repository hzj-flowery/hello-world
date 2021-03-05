import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonGrainCarAvatar from "../../../ui/component/CommonGrainCarAvatar";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import GrainCarConfigHelper from "./GrainCarConfigHelper";

var BG_TRAIN_POS_2ROW = cc.v2(0, -61);
var BG_TRAIN_POS_3ROW = cc.v2(0, -51);

const {ccclass, property} = cc._decorator;
@ccclass
export default class GrainCarInfoNode  extends ViewBase{
    
    @property({
        type: cc.Node,
        visible: true
    })
    _bgTrain: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelAbility: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelHp: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tipRunTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tipLevel1: cc.Label = null;


    @property({
        type: cc.Label,
        visible: true
    })
    _labelLevel1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleLevel1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tipLevel1Once: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleAbility: cc.Label = null;

    

    @property({
        type: cc.Label,
        visible: true
    })
    _titleHp: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAbility: cc.Node = null;

    @property({
        type: CommonGrainCarAvatar,
        visible: true
    })
    _grainCarAvatar: CommonGrainCarAvatar = null;

    
    
    
    private _bIsRightType:boolean = false;

    onCreate() {
        this.node.cascadeOpacity = (true);
        UIHelper.enableOutline(this._labelAbility,new cc.Color(130,61,9),1);
        UIHelper.enableOutline(this._titleHp,new cc.Color(130,61,9),1);
        UIHelper.enableOutline(this._titleAbility,new cc.Color(130,61,9),1);
        UIHelper.enableOutline(this._labelHp,new cc.Color(130,61,9),1);
        
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(level) {
        this._bgTrain.active = (true);
        this._setNodeLevel1(false);
        this._grainCarAvatar.updateUI(level);
        this._grainCarAvatar.playIdle();
        if (level == 3) {
            this._grainCarAvatar.setScale(1.7/2);
        } else {
            this._grainCarAvatar.setScale(1.8/2);
        }
        var config = GrainCarConfigHelper.getGrainCarConfig(level);
        this._labelHp.string = (config.stamina);
        if (level == 1) {
            var buff = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving) / GrainCarConfigHelper.getGrainCarMoveTime();
            this._labelAbility.string = (Lang.get('grain_car_ability_speed', { num: buff }));
            this._bgTrain.setPosition(BG_TRAIN_POS_2ROW);
        } else if (level == 2) {
            var buff = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving) / GrainCarConfigHelper.getGrainCarMoveTime();
            this._labelAbility.string = (Lang.get('grain_car_ability_speed', { num: buff }));
            this._bgTrain.setPosition(BG_TRAIN_POS_2ROW);
        } else if (level == 3) {
            this._labelAbility.string = (Lang.get('grain_car_ability', { num: config.stop_reduce / 10 }));
            this._bgTrain.setPosition(BG_TRAIN_POS_2ROW);
        } else if (level == 4) {
            if (this._bIsRightType) {
                this._bgTrain.x = (-65);
            }
            this._bgTrain.y = (BG_TRAIN_POS_3ROW.y);
            var stopTime = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving) / GrainCarConfigHelper.getGrainCarMoveTime();
            var speed = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving) / GrainCarConfigHelper.getGrainCarMoveTime();
            var armyAdd = GrainCarConfigHelper.getGrainCarAttackLose() * (config.attack_lose_rate / 1000);
            this._labelAbility.string = (Lang.get('grain_car_ability_level_4', {
                num1: stopTime,
                num2: speed,
                num3: armyAdd
            }));
        } else if (level == 5) {
            if (this._bIsRightType) {
                this._bgTrain.x = (-80);
            } else {
                this._bgTrain.x = (-40);
            }
            this._bgTrain.y = (BG_TRAIN_POS_3ROW.y);
            var stopTime = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving) / GrainCarConfigHelper.getGrainCarMoveTime();
            var speed = 100 * (GrainCarConfigHelper.getGrainCarMoveTime() - config.moving) / GrainCarConfigHelper.getGrainCarMoveTime();
            var armyAdd = GrainCarConfigHelper.getGrainCarAttackLose() * (config.attack_lose_rate / 1000);
            var hpAdd = config.recovery_stamina;
            this._labelAbility.string = (Lang.get('grain_car_ability_level_5', {
                num1: stopTime,
                num2: speed,
                num3: armyAdd,
                num4: hpAdd
            }));
        }
    }
    _setNodeLevel1(bLevel1) {
        this._tipRunTime.node.active = (false);
        this._titleLevel1.node.active = (bLevel1);
        this._labelLevel1.node.active = (bLevel1);
        this._tipLevel1.node.active = (bLevel1);
        this._tipLevel1Once.node.active = (bLevel1);
        this._titleHp.node.active = (!bLevel1);
        this._labelHp.node.active = (!bLevel1);
        this._nodeAbility.active = (!bLevel1);
        this._grainCarAvatar.node.active = (!bLevel1);
    }
    setRuntime(bRuntime) {
        this._tipRunTime.node.active = (bRuntime);
        this._titleLevel1.node.active = (!bRuntime);
        this._labelLevel1.node.active = (!bRuntime);
        this._tipLevel1.node.active = (!bRuntime);
        this._tipLevel1Once.node.active = (!bRuntime);
        this._titleHp.node.active = (!bRuntime);
        this._labelHp.node.active = (!bRuntime);
        this._nodeAbility.active = (!bRuntime);
        this._grainCarAvatar.node.active = (bRuntime);
    }
    updateLeve1(carUnit) {
        if (carUnit.getLevel() > 1) {
            return;
        }
        var [_, _, cost] = GrainCarConfigHelper.getGrainCarDonateCost();
        var cfgLevel1 = carUnit.getConfig();
        var maxCount = Math.ceil(cfgLevel1.exp / cost);
        var uids = carUnit.getUids();
        var curCount = uids.length;
        this._labelLevel1.string = (curCount + ('/' + maxCount));
    }
    setTextType(type) {
        if (type == 1) {
            this._labelHp.node.color = (Colors.NUMBER_WHITE);
            this._labelAbility.node.color = (Colors.NUMBER_WHITE);
        } else if (type == 2) {
            this._labelHp.node.color = (Colors.NUMBER_GREEN);
            this._labelAbility.node.color = (Colors.NUMBER_GREEN);
        }
    }
    setRightType() {
        this._bIsRightType = true;
    }
};