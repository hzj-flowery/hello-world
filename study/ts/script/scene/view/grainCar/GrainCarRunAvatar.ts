import { GrainCarData } from "../../../data/GrainCarData";
import { GrainCarUnitData } from "../../../data/GrainCarUnitData";
import { Colors, G_ServerTime, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonGrainCarAvatar from "../../../ui/component/CommonGrainCarAvatar";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import GrainCarBar from "./GrainCarBar";
import GrainCarConfigHelper from "./GrainCarConfigHelper";

var NODE_FLAG_POSITIONX = -82;
var NODE_TITLE_POSITIONX = 35;
var CAR_LAYOUT = [
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 230)
    },
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 230)
    },
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 230)
    },
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 230)
    },
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 230)
    }
];
const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarRunAvatar  extends ViewBase{
    
    @property({
        type: CommonGrainCarAvatar,
        visible: true
    })
    _grainCarAvatar: CommonGrainCarAvatar = null;
    @property({
        type: GrainCarBar,
        visible: true
    })
    _barArmy: GrainCarBar = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlag: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTitle: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _guildName: cc.Label = null;
    // @property({
    //     type: cc.Label,
    //     visible: true
    // })
    // _leaveTime: cc.Label = null;
    
    
    
    
    private _bTouchEnable:boolean;
    private _carUnit:GrainCarUnitData;
    onCreate() {
        this._bTouchEnable = true;
        this._touchPanel.on(cc.Node.EventType.TOUCH_START,handler(this,this._onPanelClick));
    }
    onEnter() {
    }
    onExit() {
        this._touchPanel.off(cc.Node.EventType.TOUCH_START,handler(this,this._onPanelClick));
    }
    faceLeft() {
        var level = this._carUnit.getLevel();
        this._grainCarAvatar.turnBack(true);
        this._nodeFlag.x = (-NODE_FLAG_POSITIONX);
        this._nodeTitle.x = (CAR_LAYOUT[level-1].title.x);
    }
    faceRight() {
        var level = this._carUnit.getLevel();
        this._grainCarAvatar.turnBack(false);
        this._nodeFlag.x = (NODE_FLAG_POSITIONX);
        this._nodeTitle.x = (CAR_LAYOUT[level-1].title.x);
    }
    updateUI() {
        var carUnit = G_UserData.getGrainCar().getGrainCar();
        this._carUnit = carUnit;
        var level = carUnit.getLevel();
        this._grainCarAvatar.updateUI(level);
        this._nodeFlag.setPosition(CAR_LAYOUT[level-1].flag);
        this._nodeTitle.setPosition(CAR_LAYOUT[level-1].title);
        this._guildName.string = (carUnit.getGuild_name() + (Lang.get('grain_car_guild_de') + carUnit.getConfig().name));
        this._guildName.node.color = (Colors.BRIGHT_BG_GREEN);
        UIHelper.enableOutline(this._guildName,Colors.COLOR_QUALITY_OUTLINE[1], 2)
        this._barArmy.updateBarWithCarUnit(carUnit);
        this._grainCarAvatar.playRun();
        if (carUnit.getStamina() <= 0) {
        }
    }
    playRun() {
        this._grainCarAvatar.playRun();
    }
    playIdle() {
        this._grainCarAvatar.playIdle();
    }
    playDead() {
        this._grainCarAvatar.playDead();
    }
    setScale(scale) {
        this._grainCarAvatar.setScale(scale);
    }
    setGrainCarScale(x,y){
        this._grainCarAvatar.node.scaleX = x;
        this._grainCarAvatar.node.scaleY = y;
    }
    setTouchEnable(bEnable) {
        this._bTouchEnable = bEnable;
    }
    _updateTimer() {
        var startTime = GrainCarConfigHelper.getNextGrainCarStartTime();
        // this._leaveTime.string = (G_ServerTime.getLeftSecondsString(startTime));
        // this._updateLeaveTime();
    }
    _onPanelClick(sender) {
        if (!this._carUnit) {
            return;
        }
        if (!this._bTouchEnable) {
            return;
        }
        var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
        }
    }
};
