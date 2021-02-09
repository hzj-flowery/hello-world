local TenJadeAuctionConst = {}

--跨服拍卖参数配置
TenJadeAuctionConst.OPEN_COUNT_DOWN     = 1    -- 300        拍卖开启倒计时（秒）
TenJadeAuctionConst.EXTEND_START_TIME   = 2    -- 30         顶价加时触发时间（拍卖结束前x秒）
TenJadeAuctionConst.EXTEND_TIME         = 3    -- 120        顶价加时（秒）
TenJadeAuctionConst.ENTRANCE_OPEN_TIME  = 6    -- 00|00|00   玩家可以看到活动入口和广告页的时间（活动当天x时x分x秒）
TenJadeAuctionConst.SHOW_ICON_START     = 11   -- 16|2102    活动界面展示图标左1


TenJadeAuctionConst.PHASE_DEFAULT       = 0    --未开启
TenJadeAuctionConst.PHASE_SHOW          = 1    --入口展示阶段 
TenJadeAuctionConst.PHASE_ITEM_SHOW     = 2    --商品展示阶段 
TenJadeAuctionConst.PHASE_START         = 3    --拍卖阶段
TenJadeAuctionConst.PHASE_END           = 4    --拍卖结束阶段

TenJadeAuctionConst.TAG_NAME = {
    [1] = Lang.get("ten_jade_auction_tag_name_jade"),
    [2] = Lang.get("ten_jade_auction_tag_name_silk_bag"),
    [3] = Lang.get("ten_jade_auction_tag_name_item"),
    [10] = Lang.get("ten_jade_auction_tag_name_other"),
}

return readOnly(TenJadeAuctionConst)