import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarRoutePoint extends ViewBase {

    public static POINT_TYPE_START = 1;
    public static POINT_TYPE_MID = 2;
    public static POINT_TYPE_END = 3;

    @property({
        type: cc.Node,
        visible: true
    })
    _startPoint: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _endPoint: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _curPoint: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _routeName: cc.Label = null;



    private _mineId;
    private _pointType;
    private _posX;
    ctor(mineId) {
        this._mineId = mineId;
        this._pointType = GrainCarRoutePoint.POINT_TYPE_MID;
        this._posX = 0;
        this.node.name = ('GrainCarRoutePoint');
    }
    onCreate() {
    }
    onEnter() {
        this._initUI();
    }
    onExit() {
    }
    onShowFinish() {
    }
    setReach(bIsReach) {
        this._startPoint.active = (false);
        this._endPoint.active = (false);
        this._curPoint.active = (false);
        if (this._pointType == GrainCarRoutePoint.POINT_TYPE_MID) {
            this._curPoint.active = (bIsReach);
        } else if (this._pointType == GrainCarRoutePoint.POINT_TYPE_START) {
            this._startPoint.active = (bIsReach);
        } else if (this._pointType == GrainCarRoutePoint.POINT_TYPE_END) {
            this._endPoint.active = (bIsReach);
        }
    }
    setPointType(pointType) {
        this._pointType = pointType;
    }
    recordPosX(posX) {
        this._posX = posX;
    }
    getPosX() {
        return this._posX;
    }
    showRouteName(bShow) {
        if (bShow) {
            var mineConfig = G_UserData.getMineCraftData().getMineConfigById(this._mineId);
            var quality = mineConfig.pit_color;
            this._routeName.string = (mineConfig.pit_name);
            this._routeName.node.color = (Colors.COLOR_PIT_NAME[quality].color);
            UIHelper.enableOutline(this._routeName, Colors.COLOR_PIT_NAME[quality].outlineColor, 1)
        } else {
            var quality = 5;
            this._routeName.string = (Lang.get('grain_car_pit_unknow'));
            this._routeName.node.color = (Colors.COLOR_PIT_NAME[quality].color);
            UIHelper.enableOutline(this._routeName, Colors.COLOR_PIT_NAME[quality].outlineColor, 1);
        }
    }
    _initUI() {
        var mineConfig = G_UserData.getMineCraftData().getMineConfigById(this._mineId);
        var quality = mineConfig.pit_color;
        this._routeName.string = (mineConfig.pit_name);
        this._routeName.node.color = (Colors.COLOR_PIT_NAME[quality].color);
        UIHelper.enableOutline(this._routeName, Colors.COLOR_PIT_NAME[quality].outlineColor, 1)
    }
}