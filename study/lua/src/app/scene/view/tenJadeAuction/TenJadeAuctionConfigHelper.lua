local TenJadeAuctionConfigHelper = {}
local TenJadeAuctionPrice = require("app.config.ten_jade_auction_price")
local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")

------------------------------------------------------------
--------------ten_jade_auction_price 配置-----------------------
------------------------------------------------------------
function TenJadeAuctionConfigHelper.getPriceConfig(id)
    local info = require("app.config.ten_jade_auction_price").get(id)
	assert(info, string.format("ten_jade_auction_price config can not find id = %d", id))
	return info
end

------------------------------------------------------------
--------------ten_jade_auction_para 配置--------------------
------------------------------------------------------------
--拍卖前开启倒计时（秒）
function TenJadeAuctionConfigHelper.getCountDown()
    local info = require("app.config.ten_jade_auction_para").get(TenJadeAuctionConst.OPEN_COUNT_DOWN)
    assert(info, string.format("ten_jade_auction_para config can not find id = %d", TenJadeAuctionConst.OPEN_COUNT_DOWN))
    return tonumber(info.content)
end

--顶价加时触发时间（拍卖结束前x秒内顶价，会增加结束时间）
function TenJadeAuctionConfigHelper.getExtendStartTime()
    local info = require("app.config.ten_jade_auction_para").get(TenJadeAuctionConst.EXTEND_START_TIME)
    assert(info, string.format("ten_jade_auction_para config can not find id = %d", TenJadeAuctionConst.EXTEND_START_TIME))
    return tonumber(info.content)
end

--顶价加时（秒）
function TenJadeAuctionConfigHelper.getExtendTime()
    local info = require("app.config.ten_jade_auction_para").get(TenJadeAuctionConst.EXTEND_TIME)
    assert(info, string.format("ten_jade_auction_para config can not find id = %d", TenJadeAuctionConst.EXTEND_TIME))
    return tonumber(info.content)
end

--玩家可以看到活动入口和广告页的时间（活动当天x时x分x秒）
function TenJadeAuctionConfigHelper.getEntranceOpenTime()
    local info = require("app.config.ten_jade_auction_para").get(TenJadeAuctionConst.ENTRANCE_OPEN_TIME)
    assert(info, string.format("ten_jade_auction_para config can not find id = %d", TenJadeAuctionConst.ENTRANCE_OPEN_TIME))
    local array = string.split(info.content, "|")
    return tonumber(array[1]), tonumber(array[2]), tonumber(array[3])
end

--限时活动展示道具id
function TenJadeAuctionConfigHelper.getShowItem(index)
    local id = TenJadeAuctionConst.SHOW_ICON_START + index - 1
    local info = require("app.config.ten_jade_auction_para").get(id)
    assert(info, string.format("ten_jade_auction_para config can not find id = %d", id))
    local array = string.split(info.content, "|")
    return tonumber(array[1]), tonumber(array[2])
end


------------------------------------------------------------
--------------------------方法-------------------------------
------------------------------------------------------------
--根据竞拍人数确定跳多少价格
function TenJadeAuctionConfigHelper.getPriceAddWithIndex()
    local info = TenJadeAuctionConfigHelper.getPriceConfig(id)
    return info.price_add
end

--活动入口显示时间戳
function TenJadeAuctionConfigHelper.getAuctionOpenTimeStamp()
    local openTime = G_UserData:getTenJadeAuction():getCurAuctionStartTime()
    local h, m, s = TenJadeAuctionConfigHelper.getEntranceOpenTime()
    local openTimeZero = G_ServerTime:secondsFromZero(openTime)
    return openTimeZero + h * 3600 + m * 60 + s
end

--处于哪个阶段
function TenJadeAuctionConfigHelper.getAuctionPhase()
    local curTime = G_ServerTime:getTime()
    local curAuctionInfo = G_UserData:getTenJadeAuction():getCurAuctionInfo()
    if not G_UserData:getTenJadeAuction():hasAuction() then
        return TenJadeAuctionConst.PHASE_END
    end
    local endTime = curAuctionInfo:getEnd_time()
    local startTime = curAuctionInfo:getStart_time()
    local countDown = TenJadeAuctionConfigHelper.getCountDown()
    if curTime < TenJadeAuctionConfigHelper.getAuctionOpenTimeStamp() then
        return TenJadeAuctionConst.PHASE_DEFAULT
    elseif curTime < startTime then
        return TenJadeAuctionConst.PHASE_SHOW
    elseif curTime < startTime + countDown then
        return TenJadeAuctionConst.PHASE_ITEM_SHOW
    elseif curTime < endTime then
        return TenJadeAuctionConst.PHASE_START
    else
        return TenJadeAuctionConst.PHASE_END
    end
end



return TenJadeAuctionConfigHelper