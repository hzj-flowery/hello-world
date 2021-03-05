import { TenJadeAuctionItemData } from "../../../data/TenJadeAuctionItemData";
import { G_UserData, G_Prompt } from "../../../init";
import { table } from "../../../utils/table";
import { TenJadeAuctionConfigHelper } from "./TenJadeAuctionConfigHelper";
import { TenJadeAuctionConst } from "../../../const/TenJadeAuctionConst";
import { Lang } from "../../../lang/Lang";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

export namespace TenJadeAuctionDataHelper {
export function fakeData() {
    function fakeUnitData() {
        var itemData = new TenJadeAuctionItemData();
        var data = {
            id: 1,
            item: {
                type: 6,
                value: 555,
                size: 1
            },
            init_price: 100,
            add_price: 10,
            now_price: 500,
            open_time: 1577932256,
            start_time: 1577932256,
            end_time: 1577959200,
            money_type: 1
        }
        itemData.setProperties(data);
        return itemData;
    }
    var list = []
    for (var i = 1; i <= 6; i++) {
        var data = fakeUnitData();
        var viewData = {
            focused: 0,
            selected: 0
        }
        table.insert(list, {
            unitData: data,
            viewData: viewData
        });
    }
    return list;
}
export function getItemList() {
    var itemList = G_UserData.getTenJadeAuction().getTagItemList();
    for (var _ in itemList) {
        var tag = itemList[_];
        for (_ in tag.list) {
            var item = tag.list[_];
            item.viewData = {
                focused: 0,
                selected: 0
            }
        }
    }
    return itemList;
}
export function sort(list) {
    var sortFunc = function(a, b) {
        if (a.unitData.getOrder() == b.unitData.getOrder()) {
            return a.unitData.getId() < b.unitData.getId();
        }
        return a.unitData.getOrder() < b.unitData.getOrder();
    }
    table.sort(list, sortFunc);
    return list;
}
export function isAuctionStart() {
    var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
    return phase == TenJadeAuctionConst.PHASE_START;
}
export function showAuctionFailedTips(failedItems) {
    if (failedItems.length > 0) {
        for (var _ in failedItems) {
            var item = failedItems[_];
            var itemParams = TypeConvertHelper.convert(item.type, item.value, item.size);
            if (itemParams == null) {
                return;
            }
            G_Prompt.showTip(Lang.get('ten_jade_auction_failed', { name: itemParams.name }));
        }
    }
}

}