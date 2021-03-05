import { BaseData } from "./BaseData";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

var schema = {};
schema['id'] = [
    'number',
    0
];
schema['config_id'] = [
    'number',
    0
];
schema['item'] = [
    'table',
    {}
];
schema['init_price'] = [
    'number',
    0
];
schema['add_price'] = [
    'number',
    0
];
schema['now_price'] = [
    'number',
    0
];
schema['now_buyer'] = [
    'number',
    0
];
schema['final_price'] = [
    'number',
    0
];
schema['open_time'] = [
    'number',
    0
];
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['boss_id'] = [
    'number',
    0
];
schema['order_id'] = [
    'number',
    0
];
schema['money_type'] = [
    'number',
    0
];
schema['focused'] = [
    'number',
    0
];
schema['tag_id'] = [
    'number',
    0
]
schema['delete'] = [
    'number',
    0
];
schema['order'] = [
    'number',
    0
];
export class TenJadeAuctionItemData extends BaseData {
    public static schema = schema;

    initData(properties) {
        this.setProperties(properties);
        var info = G_ConfigLoader.getConfig(ConfigNameConst.TEN_JADE_AUCTION_CONTENT).get(properties.config_id);
        this.setTag_id(info.auction_full_tab);
        this.setOrder(info.order);
    }
}