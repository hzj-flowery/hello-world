--跨服拍卖数据
local BaseData = require("app.data.BaseData")
local TenJadeAuctionData = class("TenJadeAuctionData", BaseData)
local TenJadeAuctionItemData = require("app.data.TenJadeAuctionItemData") 
local TenJadeAuctionInfoData = require("app.data.TenJadeAuctionInfoData") 
local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")
local LinkedList = require("app.utils.dataStruct.LinkedList")
local TenJadeAuctionDataHelper = import("app.scene.view.tenJadeAuction.TenJadeAuctionDataHelper")

local schema = {}

TenJadeAuctionData.schema = schema


function TenJadeAuctionData:ctor(properties)
    TenJadeAuctionData.super.ctor(self, properties)
    self._auctionInfoQueue = LinkedList.new() --链表 各个拍卖活动
    self._itemList = {}
    self._tagItemList = {}
    self._tagNameList = {}--页签名字列表
    self._focusMap = {} --关注哈希表 {item_id, 1}
    self._idItemMap = {} --所有商品id item 映射表

    self._s2cGetCrossAuctionInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCrossAuctionInfo, --单个拍卖详情
                                        handler(self, self._s2cGetCrosssAuctionInfo))           
    self._s2cGetAllCrossAuctionInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAllCrossAuctionInfo, --全部拍卖活动
                                        handler(self, self._s2cGetAllCrosssAuctionInfo))  
    self._s2cCrossAuctionListener = G_NetworkManager:add(MessageIDConst.ID_S2C_CrossAuction, -- 竞价
                                        handler(self, self._s2cCrossAuction)) 
    self._s2cCrossAuctionLogListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCrossAuctionLog, -- 拍卖日志
                                        handler(self, self._s2cCrossAuctionLog)) 
    self._s2cCrossAuctionUpdateListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCrossAuctionItem, -- 拍卖更新
                                        handler(self, self._s2cCrossAuctionUpdate))
    self._s2cCrossAuctionInfoUpdateListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCrossAuction, -- 拍卖活动更新
                                        handler(self, self._s2cCrossAuctionInfoUpdate))
    self._s2cCrossAuctionAddFocusListener = G_NetworkManager:add(MessageIDConst.ID_S2C_CrossAuctionAddFocusRsp, -- 加关注
                                        handler(self, self._s2cCrossAuctionAddFocus))
end

-- 清除
function TenJadeAuctionData:clear()
    self._s2cGetCrossAuctionInfoListener:remove()
	self._s2cGetCrossAuctionInfoListener = nil
    self._s2cGetAllCrossAuctionInfoListener:remove()
	self._s2cGetAllCrossAuctionInfoListener = nil
    self._s2cCrossAuctionListener:remove()
	self._s2cCrossAuctionListener = nil
    self._s2cCrossAuctionLogListener:remove()
	self._s2cCrossAuctionLogListener = nil
    self._s2cCrossAuctionUpdateListener:remove()
	self._s2cCrossAuctionUpdateListener = nil
    self._s2cCrossAuctionInfoUpdateListener:remove()
	self._s2cCrossAuctionInfoUpdateListener = nil
    self._s2cCrossAuctionAddFocusListener:remove()
	self._s2cCrossAuctionAddFocusListener = nil
end

-- 重置
function TenJadeAuctionData:reset()
end

------------------------------------------------------------------------------
-- 获取某个跨服拍卖详细信息
-- message C2S_GetCrossAuctionInfo {
-- 	required uint32 auction_id = 1;
-- }
function TenJadeAuctionData:c2sGetCrossAuctionInfo(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetCrossAuctionInfo,  {auction_id = id})
end

--获取某个跨服拍卖详细信息
-- message S2C_GetCrossAuctionInfo {
-- 	optional uint32 ret = 1;
-- 	repeated AuctionItem auction_items = 2;
-- 	optional bool first = 3;
-- 	optional bool last = 4;
-- }
function TenJadeAuctionData:_s2cGetCrosssAuctionInfo(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    if message.first then
        self._tagNameList = {}
        self._itemList = {}
    end
    
    local actionItemList = rawget(message, "auction_items") or {}
    for i,v in ipairs(actionItemList) do
        local itemData = TenJadeAuctionItemData.new()
        itemData:initData(v)
        table.insert(self._itemList, itemData)
        self._idItemMap["k"..itemData:getId()] = itemData
    end

    if message.last then
        --最后页才有focus
        local focusList = rawget(message, "focus_info") or {}
        local curAucionId = self:getCurAuctionInfo():getAuction_id()
        self._focusMap = {}
        for i,v in ipairs(focusList) do
            if v.auction_id == curAucionId then
                self._focusMap[v.item_id] = 1
            end
            local itemData = self:getItemDataWithItemId(v.item_id)
            itemData:setFocused(1)
        end

        self:_createItemList()
        G_SignalManager:dispatch(SignalConst.EVENT_CROSS_AUCTION_GET_INFO, message)
    end
end

------------------------------------------------------------------------------
--获取所有跨服拍卖信息
-- message C2S_GetAllCrossAuctionInfo{
-- }
function TenJadeAuctionData:c2sGetAllCrossAuctionInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetAllCrossAuctionInfo,  {})
end

-- 获取全部跨服拍卖信息
-- message S2C_GetAllCrossAuctionInfo {
-- 	optional uint32 ret = 1;
-- 	repeated AuctionInfo cross_auction = 2;
-- }
function TenJadeAuctionData:_s2cGetAllCrosssAuctionInfo(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    local auctionList = {}
    local list = rawget(message, "cross_auction") or {}
    for i, v in pairs(list) do
        local auctionInfo = TenJadeAuctionInfoData.new()
        auctionInfo:initData(v)
        table.insert(auctionList, auctionInfo)
    end

    self:_sort(auctionList)
end
------------------------------------------------------------------------------
-- 竞价
--message C2S_CrossAuction {
    --optional uint32 auction_id = 1;
    --optional uint32 config_id = 2;  // 配置id
    --optional uint32 price = 3; 		// 价格
    --optional uint32 item_id = 4; 	// 拍卖品id
--}
function TenJadeAuctionData:c2sCrossAuction(auction_id, config_id, price, item_id)
    G_NetworkManager:send(MessageIDConst.ID_C2S_CrossAuction,  
        {auction_id = auction_id, config_id = config_id, price = price, item_id = item_id}
    )
end

-- 竞价
-- message S2C_CrossAuction {
-- 	optional uint32 ret = 1;
-- 	optional uint32 config_id = 2; // 配置id
-- 	optional uint32 item_id = 4; // 拍卖品id
-- 	optional uint32 now_price = 5; // 当前价格
-- 	optional uint64 now_price_uid = 6; // 当前价格
-- }
function TenJadeAuctionData:_s2cCrossAuction(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    
    G_SignalManager:dispatch(SignalConst.EVENT_CROSS_AUCTION_ADD_PRICE)
end
------------------------------------------------------------------------------
-- 拍卖日志
-- message C2S_GetCrossAuctioLog {
-- 	optional uint32 auction_id = 1;
-- }
function TenJadeAuctionData:c2sGetCrossAuctionLog(auction_id)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCrossAuctioLog, {auction_id = auction_id})
end

-- 拍卖日志
-- message S2C_GetCrossAuctioLog {
-- 	optional uint32 ret = 1;
-- 	optional uint32 auction_id = 2;
-- 	repeated CrossAuctioLog logs = 3;
-- }
function TenJadeAuctionData:_s2cCrossAuctionLog(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    
end
------------------------------------------------------------------------------
--拍卖品更新
--message S2C_CrossAuctionItem {
    --optional uint32 config_id = 1;
    --optional uint32 item_id = 2;
    --optional bool delete = 3;
    --optional uint32 now_price = 4;
    --optional uint64 now_buyer = 5;
    --optional uint32 end_time = 6;
    --optional uint32 add_price = 7;
--}
--message S2C_UpdateCrossAuctionItem {
    --repeated S2C_CrossAuctionItem items = 1;
--}
function TenJadeAuctionData:_s2cCrossAuctionUpdate(id, message)
    if #self._tagItemList == 0 then
        return
    end
    local itemIds = {}
    local failedItems = {} --被顶价列表
    local existDelete = false
    local myId = G_UserData:getBase():getId()
    local items = rawget(message, "items")
    for _, item in pairs(items) do
        table.insert(itemIds, item.item_id)
        print("[TenJadeAuctionData _s2cCrossAuctionUpdate] itemId1 " .. item.item_id)
        local itemData = self:getItemDataWithItemId(item.item_id)
        if item.delete == true then
            existDelete = true
            itemData:setDelete(1)
        elseif itemData:getNow_buyer() == myId and 
            item.now_buyer ~= myId then
            table.insert(failedItems, itemData:getItem())
        end
        itemData:setNow_price(item.now_price)
        itemData:setNow_buyer(item.now_buyer)
        itemData:setEnd_time(item.end_time)
        itemData:setAdd_price(item.add_price)
    end
    
    for i = #self._itemList, 1, -1 do
        if self._itemList[i]:getDelete() == 1 then
            local item = self._itemList[i]
            local itemId = item:getId()
            self._idItemMap["k"..itemId] = nil
            print("[TenJadeAuctionData _s2cCrossAuctionUpdate] itemId " .. itemId .. " deleted")
            self._focusMap[itemId] = nil
            self:_deleteTagItemList(item)
            table.remove(self._itemList, i)
        end
    end

    TenJadeAuctionDataHelper.showAuctionFailedTips(failedItems)
    
    G_SignalManager:dispatch(SignalConst.EVENT_CROSS_AUCTION_UPDATE_ITEM, itemIds, existDelete)
end

------------------------------------------------------------------------------
--拍卖活动更新
-- message S2C_UpdateCrossAuction {
-- 	optional uint32 auction_id = 1;
-- 	optional uint32 end_time = 2; 	// 刷新结束时间
-- 	optional uint32 open_state = 3; // 拍卖状态 1:开启 0:关闭
-- }
function TenJadeAuctionData:_s2cCrossAuctionInfoUpdate(id, message)
    local exist = false
    local function cond(data)
        if data and data:getAuction_id() == message.auction_id then
            exist = true
            return true
        else
            return false
        end
    end    
    local function proc(auctionInfo)
        --暂时不会改时间
        auctionInfo:setEnd_time(message.end_time)
        auctionInfo:setOpen_state(message.open_state)
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION)
        --if auctionInfo:getAuction_id() == self:getCurAuctionInfo():getAuction_id() then
            --G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS)
        --end
    end
    self._auctionInfoQueue:filter(cond, proc)

    --添加
    if not exist then
        self:_insertAuctionInfo(message)
    end
    
    --删除
    if message.open_state == 0 then
        self:_deleteAuctionInfo(message)
    end
end

------------------------------------------------------------------------------
--加关注
-- message C2S_CrossAuctionAddFocusReq {
--     optional uint32 auction_id = 1;
--     optional uint32 item_id = 2; // 拍卖品id
--     optional uint32 focus_state = 3; // 1:关注 0:取消关注
-- }
function TenJadeAuctionData:c2sCrossAuctionAddFocus(auction_id, item_id, focus_state)
    G_NetworkManager:send(MessageIDConst.ID_C2S_CrossAuctionAddFocusReq,  
        {auction_id = auction_id, item_id = item_id, focus_state = focus_state}
    )
end

-- message S2C_CrossAuctionAddFocusRsp {
--     optional uint32 ret = 1;
--     optional uint32 focus_state = 2;
--     optional CrossAuctionFocus focus_info = 2; // 关注信息
-- }
-- message CrossAuctionFocus {
-- 	optional uint32 auction_id = 1;
-- 	optional uint32 item_id = 1;
-- }
function TenJadeAuctionData:_s2cCrossAuctionAddFocus(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    local focusInfo = rawget(message, "focus_info")
    local state = message.focus_state
    local itemId = focusInfo.item_id

    local data = self:getItemDataWithItemId(itemId)
    data:setFocused(state)
    
    local curAucionId = self:getCurAuctionInfo():getAuction_id()
    if curAucionId == focusInfo.auction_id then
        self._focusMap[itemId] = state == 1 and 1 or nil
        self:_updateFocusList()
    end
    
    --G_SignalManager:dispatch(SignalConst.EVENT_CROSS_AUCTION_UPDATE_ITEM, {itemId}, false)
    G_SignalManager:dispatch(SignalConst.EVENT_CROSS_AUCTION_ADD_FOCUS, itemId, state)
end

------------------------------------------------------------------------------
--离开拍卖
function TenJadeAuctionData:c2sCrossAuctionLeave(auction_id)
    G_NetworkManager:send(MessageIDConst.ID_C2S_CrossAuctionLeave, {auction_id = auction_id})
end

------------------------------------------------------------------------------
-- 开始时间排序加入到链表
function TenJadeAuctionData:_sort(list)
    local sortFunc = function(a, b)
        --时间早的排前面
        return a:getStart_time() < b:getStart_time()
	end
	table.sort(list, sortFunc)

    for i = 1, #list do
        local node = LinkedList.node(list[i]) 
        self._auctionInfoQueue:addAtTail(node)
    end
end

-- 创建item
function TenJadeAuctionData:_createItemList()
    local itemList = self._itemList
    local tagMap = {} --tagid - index （标签id - tagList下标 哈希表）
    local tagList = { --页签列表
        {id = 0, name = Lang.get("ten_jade_auction_tag_name_all"), list = {}}, -- 全部
    }
    for i = 1, #itemList do
        local data = itemList[i]
        --页签分装
        local tagId = data:getTag_id()
        if not tagMap[tagId] then
            table.insert(tagList, {id = tagId, name = TenJadeAuctionConst.TAG_NAME[tagId], list = {}})
            tagMap[tagId] = #tagList --当前tagList下标
        end
        local index = tagMap[tagId]
        --页签内列表
        table.insert(tagList[index].list, {unitData = data, viewData = {} })
        --全部列表
        table.insert(tagList[1].list, {unitData = data, viewData = {} })
     
    end
    
    --关注列表
    table.insert(tagList, {id = 9999999, name = Lang.get("ten_jade_auction_tag_name_focus"), list = {}})
    for itemId, _ in pairs(self._focusMap) do
        local data = self:getItemDataWithItemId(itemId)
        table.insert(tagList[#tagList].list, {unitData = data, viewData = {} })
    end

     --排序页签列表
     local sortFunc = function(a, b)
        --id小的排前面
        return a.id < b.id
	end
    table.sort(tagList, sortFunc)
    
  
    --页签名字列表
    for i = 1, #tagList do
        table.insert(self._tagNameList, tagList[i].name)
    end
    
    self._tagItemList = tagList
end

--更新item列表
function TenJadeAuctionData:_deleteTagItemList(item)
    local tagId = item:getTag_id()
    local count = #self._tagItemList
    local function removeAtList(curList)
        for i = #curList, 1, -1 do
            local itemInList = curList[i].unitData
            if itemInList:getId() == item:getId() then
                table.remove(curList, i)
                break
            end
        end
        --for i, v in pairs(curList) do
            --if v.unitData:getId() == item:getId() then
                --table.remove(curList, i)
                --break
            --end
        --end
    end
    local allList = self._tagItemList[1].list
    local focusList = self._tagItemList[count].list
    removeAtList(allList)
    removeAtList(focusList)
    for _, tagInfo in pairs(self._tagItemList) do
        if tagInfo.id == tagId then
            removeAtList(tagInfo.list)
        end
    end
end

--更新关注列表
function TenJadeAuctionData:_updateFocusList()
    local count = #self._tagItemList
    self._tagItemList[count].list = {}
    for itemId, _ in pairs(self._focusMap) do
        local data = self:getItemDataWithItemId(itemId)
        table.insert(self._tagItemList[count].list, {unitData = data, viewData = {} })
    end
end

--添加活动
function TenJadeAuctionData:_insertAuctionInfo(message)
    local auctionInfo = TenJadeAuctionInfoData.new()
    auctionInfo:initData(message)

    local node = LinkedList.node(auctionInfo)
    local head = self._auctionInfoQueue:getFirst()
    if not head then
        self._auctionInfoQueue:addAtTail(node)
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION)
    end
    
    --暂时不会有多个
    --local p = head
    --local index = 1
    --while p do
    --if auctionInfo:getStart_time() < p.data:getStart_time() then
    --self._auctionInfoQueue:addAtIndex(node, index)
    --end
    --index = index + 1
    --p = p.next
    --end
    --self._auctionInfoQueue:addAtIndex(node, index)
    --G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS)
    --todo排序
end

--添加活动
function TenJadeAuctionData:_deleteAuctionInfo(message)
    local head = self._auctionInfoQueue:getFirst()
    if not head then
        return
    end
    local p = head
    while p do
        if p.data:getAuction_id() == message.auction_id then
            self._auctionInfoQueue:remove(p)
        end
        p = p.next
    end

    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION)
end
------------------------------------------------------------------------------

--获取当前拍卖信息
function TenJadeAuctionData:getCurAuctionInfo()
    local firstNode = self._auctionInfoQueue:getFirst()
    local curTime = G_ServerTime:getTime()

    --移除已经结束的拍卖
	while firstNode do
		local auctionInfo = firstNode.data
		if auctionInfo:isEnd()  then
			self._auctionInfoQueue:remove(firstNode)
			firstNode = self._auctionInfoQueue:getFirst()
		else
			break
		end
	end
    if firstNode then
        return firstNode.data
    end
    return nil
end

--获取当前拍卖开放时间
function TenJadeAuctionData:getCurAuctionStartTime()
    local auctionInfo = self:getCurAuctionInfo()
    return auctionInfo:getStart_time()
end

--获取当前拍卖结束时间
function TenJadeAuctionData:getCurAuctionEndTime()
    local auctionInfo = self:getCurAuctionInfo()
    return auctionInfo:getEnd_time()
end

--获取当前拍卖
function TenJadeAuctionData:requestCurAuctionItem()
    local auctionInfo = self:getCurAuctionInfo()
    if auctionInfo then
        self:c2sGetCrossAuctionInfo(auctionInfo:getAuction_id())
    end
end

--是否有拍卖活动
function TenJadeAuctionData:hasAuction()
    return self._auctionInfoQueue:count() > 0
end

--获取item列表
function TenJadeAuctionData:getTagItemList()
    return self._tagItemList
end

--获取页签名字列表
function TenJadeAuctionData:getTagNameList()
    return self._tagNameList
end

--根据id获取itemData
function TenJadeAuctionData:getItemDataWithItemId(itemId)
    return self._idItemMap["k" .. itemId]
end


return TenJadeAuctionData