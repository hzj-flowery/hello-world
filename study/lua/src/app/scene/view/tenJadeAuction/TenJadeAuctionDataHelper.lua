local TenJadeAuctionDataHelper = {}
local TenJadeAuctionConfigHelper = import("app.scene.view.tenJadeAuction.TenJadeAuctionConfigHelper")
local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")

--测试数据
function TenJadeAuctionDataHelper.fakeData()
    local function fakeUnitData()
        local TenJadeAuctionItemData = require("app.data.TenJadeAuctionItemData")
        local itemData = TenJadeAuctionItemData.new()
        local data = {
            id = 1,
            item = {
                type = 6,
                value = 555,
                size = 1,
            },
            init_price = 100,
            add_price = 10,
            now_price = 500,
            open_time = 1577932256,
            start_time = 1577932256,
            end_time = 1577959200,
            money_type = 1,
        }
        itemData:setProperties(data)
        return itemData
    end
    local list = {}
    for i = 1, 6 do
        local data = fakeUnitData()
        local viewData = {
            focused = 0,
            selected = 0,
        }
        table.insert(list, {unitData = data, viewData = viewData})
    end
    return list
end

--获取拍卖列表
-- itemList
-- {
--     {
--         unitData = TenJadeAuctionItemData --原始数据
--         viewData = 
--         {
--             focused = 0,     --当前聚焦
--             selected = 0    --当前选中
--         }
--     }
--     ...
-- }
-- tagList = {
--     id = 1,
--     name = "玉石",
--     list = itemList
-- }
function TenJadeAuctionDataHelper.getItemList()
    local itemList = G_UserData:getTenJadeAuction():getTagItemList()
    for _, tag in pairs(itemList) do
        for _, item in pairs(tag.list) do
            item.viewData = {
                focused = 0,
                selected = 0,
            }
        end
    end
    return itemList
end

--itemDataList排序
function TenJadeAuctionDataHelper.sort(list)
    local sortFunc = function(a, b)
        if a.unitData:getOrder() == b.unitData:getOrder() then
            return a.unitData:getId() < b.unitData:getId()
        end
        return a.unitData:getOrder() < b.unitData:getOrder()
    end
    table.sort(list, sortFunc)

    return list
end

--是否在跨服跨服拍卖时间
function TenJadeAuctionDataHelper.isAuctionStart()
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    return phase == TenJadeAuctionConst.PHASE_START
end

--被顶价提示
function TenJadeAuctionDataHelper.showAuctionFailedTips(failedItems)
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    if #failedItems > 0 then
        for _, item in pairs(failedItems) do
            local itemParams = TypeConvertHelper.convert(item.type, item.value, item.size)
            if itemParams == nil then
                return
            end
            G_Prompt:showTip(Lang.get("ten_jade_auction_failed",  {name = itemParams.name}))
        end
    end
end


return TenJadeAuctionDataHelper