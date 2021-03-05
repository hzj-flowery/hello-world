import { BaseData } from "./BaseData";
import { G_NetworkManager,  G_UserData, G_SignalManager, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";

export class ChapterBoxData extends BaseData {
    private _signalRecvGetPeriodBoxAward;
    private _alreadyGetAwardIDs;
    private _curBoxInfo;

    constructor() {
        super()
        this._signalRecvGetPeriodBoxAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetPeriodBoxAward, this._s2cGetPeriodBoxAward.bind(this));
        this._alreadyGetAwardIDs = {};
    }

    public clear() {
        this._signalRecvGetPeriodBoxAward.remove();
        this._signalRecvGetPeriodBoxAward = null;
    }

    public reset() {
    }

    public udpateCurBoxinfo() {
        var storyPeriodBox = G_ConfigLoader.getConfig(ConfigNameConst.STORY_PERIOD_BOX);
        var lastChapterID = G_UserData.getChapter().getLastOpenChapterId();
        var temps = [];
        var indexs = storyPeriodBox.index();
        for (const key in indexs) {
            var v = indexs[key];
            var config = storyPeriodBox.indexOf(v);
            temps.push(config);
        }
        temps.sort(function (a, b) {
            return a.chapter - b.chapter;
        });

        var lastChapter = 0;
        var notFinishList = [];
        for (let i = 0; i < temps.length; i++) {
            var v = temps[i];
            var item: any = {};
            item.length = v.chapter - lastChapter;
            item.config = v;
            lastChapter = v.chapter;
            if (!this._alreadyGetAwardIDs[v.id]) {
                notFinishList.push(item);
            }

        }
        this._curBoxInfo = notFinishList[0];
    }

    public getCurBoxInfo() {
        if (!this._curBoxInfo) {
            this.udpateCurBoxinfo();
        }
        return this._curBoxInfo;
    }

    public isCurBoxAwardsCanGet() {
        var curBoxInfo = this.getCurBoxInfo();
        if (curBoxInfo) {
            var lastChapterID = G_UserData.getChapter().getLastOpenChapterId();
            if (lastChapterID > curBoxInfo.config.chapter) {
                return true;
            }
        }
        return false;
    }

    public updateData(boxInfo: any[]) {
        if (!boxInfo) {
            return;
        }
        this._alreadyGetAwardIDs = {};
        for (let i = 0; i < boxInfo.length; i++) {
            var v = boxInfo[i];
            this._alreadyGetAwardIDs[v] = true;

        }
        this.udpateCurBoxinfo();
    }

    public c2sGetPeriodBoxAward(box_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetPeriodBoxAward, { box_id: box_id });
    }

    public _s2cGetPeriodBoxAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var box_id = message.box_id;
        if (box_id) {
            this._alreadyGetAwardIDs[box_id] = true;
        }
        this.udpateCurBoxinfo();
        var awards = message.awards;
        G_SignalManager.dispatch(SignalConst.EVENT_GET_PERIOD_BOX_AWARD_SUCCESS, awards);
    }
}