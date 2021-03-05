import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { TenJadeAuctionConst } from "../../../const/TenJadeAuctionConst";
import { G_ConfigLoader, G_ServerTime, G_UserData } from "../../../init";
import { assert } from "../../../utils/GlobleFunc";


export class TenJadeAuctionConfigHelper{
static  getPriceConfig(id) {
    var info = G_ConfigLoader.getConfig(ConfigNameConst.TEN_JADE_AUCTION_PRICE).get(id);
    assert(info, 'ten_jade_auction_price config can not find id = %d');
    return info;
};
static  getCountDown() {
    var info = G_ConfigLoader.getConfig(ConfigNameConst.TEN_JADE_AUCTION_PARA).get(TenJadeAuctionConst.OPEN_COUNT_DOWN);
    assert(info, 'ten_jade_auction_para config can not find id = %d');
    return parseInt(info.content);
};
static  getExtendStartTime() {
    var info = G_ConfigLoader.getConfig(ConfigNameConst.TEN_JADE_AUCTION_PARA).get(TenJadeAuctionConst.EXTEND_START_TIME);
    assert(info, 'ten_jade_auction_para config can not find id = %d');
    return parseInt(info.content);
};
static  getExtendTime() {
    var info = G_ConfigLoader.getConfig(ConfigNameConst.TEN_JADE_AUCTION_PARA).get(TenJadeAuctionConst.EXTEND_TIME);
    assert(info, 'ten_jade_auction_para config can not find id = %d');
    return parseInt(info.content);
};
static  getEntranceOpenTime() {
    var info = G_ConfigLoader.getConfig(ConfigNameConst.TEN_JADE_AUCTION_PARA).get(TenJadeAuctionConst.ENTRANCE_OPEN_TIME);
    assert(info, 'ten_jade_auction_para config can not find id = %d');
    var array = info.content.split('|');
    return [
        parseInt(array[0]),
        parseInt(array[1]),
        parseInt(array[2])
    ];
};
static  getShowItem(index) {
    var id = TenJadeAuctionConst.SHOW_ICON_START + index - 1;
    var info = G_ConfigLoader.getConfig(ConfigNameConst.TEN_JADE_AUCTION_PARA).get(id);
    assert(info, 'ten_jade_auction_para config can not find id = %d');
    var array = info.content.split('|');
    return [
        parseInt(array[0]),
        parseInt(array[1])
    ];
};
static  getPriceAddWithIndex() {
    // var info = TenJadeAuctionConfigHelper.getPriceConfig(id);
    // return info.price_add;
};
static  getAuctionOpenTimeStamp() {
    var openTime = G_UserData.getTenJadeAuction().getCurAuctionStartTime();
    var [h, m, s] = TenJadeAuctionConfigHelper.getEntranceOpenTime();
    var openTimeZero = G_ServerTime.secondsFromZero(openTime);
    return openTimeZero + h * 3600 + m * 60 + s;
};
static getAuctionPhase () {
    var curTime = G_ServerTime.getTime();
    var curAuctionInfo = G_UserData.getTenJadeAuction().getCurAuctionInfo();
    if (!G_UserData.getTenJadeAuction().hasAuction()) {
        return TenJadeAuctionConst.PHASE_END;
    }
    var endTime = curAuctionInfo.getEnd_time();
    var startTime = curAuctionInfo.getStart_time();
    var countDown = TenJadeAuctionConfigHelper.getCountDown();
    if (curTime < TenJadeAuctionConfigHelper.getAuctionOpenTimeStamp()) {
        return TenJadeAuctionConst.PHASE_DEFAULT;
    } else if (curTime < startTime) {
        return TenJadeAuctionConst.PHASE_SHOW;
    } else if (curTime < startTime + countDown) {
        return TenJadeAuctionConst.PHASE_ITEM_SHOW;
    } else if (curTime < endTime) {
        return TenJadeAuctionConst.PHASE_START;
    } else {
        return TenJadeAuctionConst.PHASE_END;
    }
};
}