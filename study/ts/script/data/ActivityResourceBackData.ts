import { BaseData } from './BaseData';
import { MessageIDConst } from '../const/MessageIDConst';
import { G_NetworkManager, G_UserData, G_SignalManager } from '../init';
import { Slot } from '../utils/event/Slot';
import { ActivityBaseData } from './ActivityBaseData';
import { ActivityConst } from '../const/ActivityConst';
import { FunctionConst } from '../const/FunctionConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import { clone } from '../utils/GlobleFunc';
import { ActivityResourceBackItemData } from './ActivityResourceBackItemData';
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
schema['items'] = [
    'object',
    {}
];
export interface ActivityResourceBackData {
    getBaseActivityData(): ActivityBaseData
    setBaseActivityData(value: ActivityBaseData): void
    getLastBaseActivityData(): ActivityBaseData
    getItems(): any[]
    setItems(value: any[]): void
    getLastItems(): any[]
}
export class ActivityResourceBackData extends BaseData {
    public static schema = schema;

    public _signalRecvGetResourceBackData: Slot;
    public _signalRecvActResourceBackAward: Slot;

    constructor(properties?) {
        super(properties);
        super(properties)
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_RESROUCE_BACK });
        this.setBaseActivityData(activityBaseData);
        this._signalRecvGetResourceBackData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetResourceBackData, this._s2cGetResourceBackData.bind(this));
        this._signalRecvActResourceBackAward = G_NetworkManager.add(MessageIDConst.ID_S2C_ActResourceBackAward, this._s2cActResourceBackAward.bind(this));
    }
    public hasRedPoint() {
        let isHave = false;
        let items = this.getItems();
        for (let k in items) {
            let v = items[k];
            if (!v.isAlreadyBuy()) {
                isHave = true;
                break;
            }
        }
        if (isHave && !G_UserData.getRedPoint().isThisLoginClick(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_RESROUCE_BACK })) {
            return true;
        }
        return false;
    }
    public clear() {
        this._signalRecvGetResourceBackData.remove();
        this._signalRecvGetResourceBackData = null;
        this._signalRecvActResourceBackAward.remove();
        this._signalRecvActResourceBackAward = null;
    }
    public reset() {
    }
    public getNotBuyItems() {
        let items = this.getItems();
        let notBuyItems = [];
        for (let k in items) {
            let v = items[k];
            if (!v.isAlreadyBuy()) {
                notBuyItems.push(v);
            }
        }
        return notBuyItems;
    }
    public _sortItems() {
        let items = this.getItems();
        items.sort(function (a, b) {
            return b.getId() - a.getId();
        });
        this.setItems(items);
    }
    public getItemById(id) {
        let items = this.getItems();
        for (let k in items) {
            let v = items[k];
            if (v.getId() == id) {
                return v;
            }
        }
    }
    public _s2cGetResourceBackData(id, message) {
        let items = [];
        let data = message['data'];
        if (data) {
            for (let k in data) {
                let v = data[k];
                let singleData = new ActivityResourceBackItemData();
                singleData.updateData(v);
                items.push(singleData);
            }
        }
        this.setItems(items);
        this._sortItems();
    }
    public c2sActResourceBackAward(id, back_type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActResourceBackAward, {
            id: id,
            back_type: back_type
        });
    }
    public _s2cActResourceBackAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        id = message['id'];
        if (id) {
            let itemData = this.getItemById(id);
            itemData.setState(1);
        }
        let awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_ACT_RESOURCE_BACK_AWARD_SUCCESS, awards);
    }
    public mockData() {
        let singleData = {
            id: 1,
            awards: [
                {
                    type: 5,
                    value: 3,
                    size: 10
                },
                {
                    type: 5,
                    value: 4,
                    size: 10
                }
            ],
            value: 2,
            state: 0
        };
        let datas = {
            ret: 1,
            data: []
        };
        for (let i = 0; i < 2; i++) {
            let d = clone(singleData);
            datas.data.push(d);
        }
        this._s2cGetResourceBackData(null, datas);
    }
}