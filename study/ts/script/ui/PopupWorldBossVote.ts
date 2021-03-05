import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_ConfigLoader, G_ServerTime, G_UserData } from "../init";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import PopupBase from "./PopupBase";

const { ccclass, property } = cc._decorator; @ccclass
export default class PopupWorldBossVote extends PopupBase {
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOk: CommonButtonLevel0Highlight = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _openTimeDes: cc.Label = null;

    private _type: number;
    onCreate(): void {
        this._isClickOtherClose = true;
        

        if (this._type == 1) {
            let config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
            let curTime = G_ServerTime.getTime();
            let s1 = G_ServerTime.secondsFromToday(curTime) / 60 / 60;
            let configInfor12 = config.get(2020);
            let configInfor19 = config.get(2021);
            let p1 = configInfor12.content.split("|");
            let p2 = configInfor19.content.split("|");
            let time1 = [parseInt(p1[0]), parseInt(p1[1])];
            let time2 = [parseInt(p2[0]), parseInt(p2[1])];
            if (time1[0] < s1 && time1[1] > s1) {
                this._openTimeDes.string = "活动开启时间" + time1[1] + ":00";
            }
            else if (time2[0] < s1 && time2[1] > s1) {
                this._openTimeDes.string = "活动开启时间" + time2[1] + ":00";
            }
        }
        else {
            let config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
            let configInfor19 = config.get(2021);
            let p1 = configInfor19.content.split("|");
            let time1 = [parseInt(p1[0]), parseInt(p1[1])];
            this._openTimeDes.string = "活动开启时间" + time1[1] + ":00";
        }
    }
    setType(type: number): void {

        this._type = type;
    }
    onExit() {

    }
    onBtn() {
        this.close();
    }
}