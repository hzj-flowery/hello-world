import { BaseData } from "./BaseData";
import { Slot } from "../utils/event/Slot";
import { G_NetworkManager, G_SignalManager, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { PopupHonorTitleHelper } from "../scene/view/playerDetail/PopupHonorTitleHelper";
import { ArraySort } from "../utils/handler";
import { HonorTitleItemData } from "./HonorTitleItemData";
import { ConfigNameConst } from "../const/ConfigNameConst";

export class HonorTitleData extends BaseData {

        _listenerHonorTitleData: Slot;
        _listenerHonorEquipTitle: Slot;
        _titleItemList;
        _hasRed: boolean;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._listenerHonorTitleData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTitle, this._s2cGetHonorTitleData.bind(this));
        this._listenerHonorEquipTitle = G_NetworkManager.add(MessageIDConst.ID_S2C_EquipTitle, this._s2cEquipHonorTitle.bind(this));
        this._titleItemList = [];
        this._hasRed = false;
    }
    public clear() {
        this._listenerHonorTitleData.remove();
        this._listenerHonorTitleData = null;
        this._listenerHonorEquipTitle.remove();
        this._listenerHonorEquipTitle = null;
    }
    public reset() {
        this._titleItemList = [];
    }
    public c2sTitleInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TitleInfo, {});
    }
    public c2sEquipTitleInfo(equip_title_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EquipTitle, { title_id: equip_title_id });
    }
    public c2sClearTitles() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ClearTitleRedPoint, { title_ids: this._getFreshTitles() });
    }
    public _s2cGetHonorTitleData(id, message) {
        let titles = message['titles'];
        if (titles == null) {
            return;
        }
        this.insertHonorTitleList(titles, true);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TOWER_SUPER);
    }
    public _s2cEquipHonorTitle(id, message) {
        if (message.ret != 1) {
            return;
        }
        let now_id = message['now_id'];
        PopupHonorTitleHelper.showEquipTip(now_id);
        G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_TITLE);
    }
    public insertHonorTitleList(titles, isInit?) {
        for (let k in titles) {
            let v = titles[k];
            this._insertTitleItem(v);
        }
        ArraySort(this._titleItemList, function (item1, item2) {
            return item1.getId() < item2.getId();
        });
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE);
        G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_TITLE_INFO);
    }
    public _insertTitleItem(item) {
        if (item.on && !this.findItemDataById(item.id)) {
            let itemData = new HonorTitleItemData();
            itemData.init(this._makeItemTemplate(item));
            this._titleItemList.push(itemData);
        }
    }
    public _makeItemTemplate(item) {
        let TitleInfo = G_ConfigLoader.getConfig(ConfigNameConst.TITLE);
        let titleData = TitleInfo.get(item.id);
        console.assert(titleData, 'not title by this id');
        let template = {
            id: item.id,
            limitLevel: titleData.limit_level,
            day: titleData.day,
            timeType: titleData.time_type,
            timeValue: titleData.time_value,
            name: titleData.name,
            colour: titleData.colour,
            resource: titleData.resource,
            des: titleData.des,
            isEquip: item.equip,
            expireTime: item.expire_time,
            isOn: item.on,
            fresh: item.fresh
        };
        return template;
    }
    public updateTitleList(titles) {
        for (let k in titles) {
            let v = titles[k];
            this._updateItem(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE);
        G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_TITLE_INFO);
    }
    public _updateItem(item) {
        for (let i = 0; i < this._titleItemList.length; i++) {
            if (this._titleItemList[i].getId() == item.id) {
                if (item.on) {
                    this._titleItemList[i].updateData(item);
                } else {
                    this._titleItemList.splice(i, 1);
                }
                return;
            }
        }
        this._insertTitleItem(item);
    }
    public findItemDataById(id) {
        for (let i = 0; i < this._titleItemList.length; i++) {
            if (this._titleItemList[i].getId() == id) {
                return this._titleItemList[i];
            }
        }
    }
    public getHonorTitleList() {
        return this._titleItemList;
    }
    public isHasRedPoint() {
        for (let i = 0; i < this._titleItemList.length; i++) {
            if (this._titleItemList[i].isFresh()) {
                return true;
            }
        }
        return false;
    }
    public _getFreshTitles() {
        let fresh = [];
        for (let i = 0; i < this._titleItemList.length; i++) {
            if (this._titleItemList[i].isFresh()) {
                fresh.push(this._titleItemList[i].getId());
            }
        }
        return fresh;
    }
}
