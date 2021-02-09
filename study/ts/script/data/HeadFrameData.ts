import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ConfigLoader, G_Prompt } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler, ArraySort } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { HeadFrameItemData } from "./HeadFrameItemData";
import { Lang } from "../lang/Lang";

export class HeadFrameData extends BaseData {
    private _curFrame: HeadFrameItemData;
    private _s2cChangeHeadFrameListener;
    private _s2cGetHeadFrameInfoListener;
    private _s2cClearHeadFrameRedPointListener;
    private _headFrameList: HeadFrameItemData[];
    private _redPointList: any[];

    constructor() {
        super()
        this._curFrame = null;
        this._s2cChangeHeadFrameListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeHeadFrame, this._s2cChangeHeadFrame.bind(this));
        this._s2cGetHeadFrameInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetHeadFrameInfo, this._s2cGetHeadFrameInfo.bind(this));
        this._s2cClearHeadFrameRedPointListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ClearHeadFrameRedPoint, this._s2cClearHeadFrameRedPoint.bind(this));
        this._headFrameList = [];
        this._redPointList = [];
        this.initFrameData();
    }
    clear() {
        this._s2cChangeHeadFrameListener.remove();
        this._s2cChangeHeadFrameListener = null;
        this._s2cGetHeadFrameInfoListener.remove();
        this._s2cGetHeadFrameInfoListener = null;
        this._s2cClearHeadFrameRedPointListener.remove();
        this._s2cClearHeadFrameRedPointListener = null;
    }

    public getCurrentFrame(): HeadFrameItemData {
        return this._curFrame;
    }

    public setCurrentFrame(frame) {
        if (frame != null) {
            this._curFrame = frame;
        }
    }

    public reset() {
        this._headFrameList = [];
        this._redPointList = [];
        this._curFrame = null;
    }

    public initFrameData() {
        this._headFrameList = [];
        function covertTab(t) {
            var tab = {};
            var keyMap = {
                id: 1,
                name: 2,
                limit_level: 3,
                day: 4,
                resource: 5,
                color: 6,
                time_type: 7,
                time_value: 8,
                des: 9
            };
            for (const k in keyMap) {
                tab[k] = t[k];
            }
            return tab;
        }
        let HeadFrameInfo = G_ConfigLoader.getConfig(ConfigNameConst.HEAD_FRAME);
        for (let i = 0; i < HeadFrameInfo.length(); i++) {
            var frameInfo = covertTab(HeadFrameInfo.indexOf(i));
            var frame = new HeadFrameItemData(frameInfo);
            this._headFrameList.push(frame);
        }
        this._sortFrameList();
    }

    public _sortFrameList() {
        ArraySort(this._headFrameList, function (a, b) {
            if (a.isHave() == b.isHave()) {
                if (a.getColor() == b.getColor()) {
                    return a.getId() > b.getId();
                } else {
                    return a.getColor() > b.getColor();
                }
            } else {
                return a.isHave();
            }
        });
    }

    public c2sClearHeadFrameRedPoint() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ClearHeadFrameRedPoint, {});
    }

    public _s2cClearHeadFrameRedPoint(id, message) {
    }

    public c2sChangeHeadFrame(frameId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeHeadFrame, { id: frameId });
    }

    public _s2cChangeHeadFrame(id, message) {
        if (message.ret == 1) {
            if (message.hasOwnProperty('cur_head_frame')) {
                var frame = new HeadFrameItemData(message.cur_head_frame);
                this.setCurrentFrame(frame);
                G_Prompt.showTipOnTop(Lang.get('frame_equip_success'));
            }
        }
    }

    public _s2cGetHeadFrameInfo(id, message) {
        this._redPointList = [];
        if (message.hasOwnProperty('headFrames')) {
            for (let k = 0; k < message.headFrames.length; k++) {
                var v = message.headFrames[k];
                for (let m = 0; m < this._headFrameList.length; m++) {
                    var n = this._headFrameList[m];
                    if (n.getId() == v.id) {
                        n.setHave(true);
                        n.setExpire_time(v.expire_time);
                        break;
                    }
                }
            }
        }
        this._sortFrameList();
        if (message.hasOwnProperty('red_point_list')) {
            for (let k = 0; k < message.red_point_list.length; k++) {
                var v = message.red_point_list[k];
                this._redPointList.push(v);
            }
        }
        var curId = message.cur_head_frame.id;
        if (curId == 0) {
            curId = 1;
        }
        this._curFrame = this.getFrameDataWithId(curId);
        if (this._headFrameList[0] != null && this._curFrame == null) {
            this._curFrame = this._headFrameList[0];
        }
    }

    public getFrameListData() {
        return this._headFrameList;
    }

    public getRedPointList() {
        return this._redPointList;
    }

    public hasRedPoint() {
        return this._redPointList.length > 0;
    }

    public isFrameHasRedPoint(id) {
        for (let k = 0; k < this._redPointList.length; k++) {
            var v = this._redPointList[k];
            if (id == v) {
                return true;
            }
        }
        return false;
    }

    public deleteRedPointBy(id) {
        for (let k = 0; k < this._redPointList.length; k++) {
            var v = this._redPointList[k];
            if (id == v) {
                this._redPointList.splice(k, 1);
            }
        }
    }

    public clearRedPointList() {
        this._redPointList = [];
    }

    public getFrameDataWithId(id) {
        for (let k = 0; k < this._headFrameList.length; k++) {
            var v = this._headFrameList[k];
            if (v.getId() == id) {
                return v;
            }
        }
        return null;
    }

    public isInHeadFrameList(id): any[] {
        for (let i = 0; i < this._headFrameList.length; i++) {
            if (this._headFrameList[i].getId() == id) {
                return [
                    true,
                    i
                ];
            }
        }
        return [
            false,
            0
        ];
    }

    public updateHeadFrame(frameList: any[]) {
        for (let k = 0; k < this._headFrameList.length; k++) {
            var v = this._headFrameList[k];
            for (let m = 0; m < frameList.length; m++) {
                var n = frameList[m];
                if (v.getId() == n.id) {
                    v.setHave(true);
                    v.setExpire_time(n.expire_time);
                    break;
                }
            }
        }
        this._sortFrameList();
    }

    public insertHeadFrame(frameList) {
        for (let k = 0; k < this._headFrameList.length; k++) {
            var v = this._headFrameList[k];
            for (let m = 0; m < frameList.length; m++) {
                var n = frameList[m];
                if (v.getId() == n.id) {
                    v.setHave(true);
                    this._redPointList.push(n.id);
                    break;
                }
            }
        }
        this._sortFrameList();
    }

    public deleteHeadFrame(frameList) {
        for (let k = 0; k < this._headFrameList.length; k++) {
            var v = this._headFrameList[k];
            for (let m = 0; m < frameList.length; m++) {
                var n = frameList[m];
                if (v.getId() == n) {
                    v.setHave(false);
                    break;
                }
            }
        }
        this._sortFrameList();
    }

    public setCurrentFrameByOp(frameData) {
        if (frameData == null || frameData.length <= 0) {
            return;
        }
        let frame = new HeadFrameItemData(frameData);
        this.setCurrentFrame(frame);
    }

    public isHasRedPoint() {
    }
}