--跨服拍卖
local ViewBase = require("app.ui.ViewBase")
local TenJadeAuctionView = class("AuctionView", ViewBase)
local TabScrollView = require("app.utils.TabScrollView")
local TenJadeAuctionCell = import(".TenJadeAuctionCell")
--local TenJadeAuctionLogNode = import(".TenJadeAuctionLogNode")
local TenJadeAuctionConfigHelper = import(".TenJadeAuctionConfigHelper")
local TenJadeAuctionDataHelper = import(".TenJadeAuctionDataHelper")
local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local FunctionConst = require("app.const.FunctionConst")
local AudioConst = require("app.const.AudioConst")

local ITEM_WIDTH = 200
local TAB_ITEM_WIDTH = 178

function TenJadeAuctionView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
    end
    local auctionInfo = G_UserData:getTenJadeAuction():getCurAuctionInfo()
    if auctionInfo then
        G_UserData:getTenJadeAuction():requestCurAuctionItem()
    else
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION)
    end
    local signal = G_SignalManager:add(SignalConst.EVENT_CROSS_AUCTION_GET_INFO, onMsgCallBack)
    return signal
end


function TenJadeAuctionView:ctor(tabIndex)
    self._nodeTabRoot = nil         --tab标签
    self._listView = nil            --listview
    self._curIndex = nil            --当前选中第几个
    self._lastItem = nil            --上一个选中项
    self._selectTabIndex = 1        --第几个标签页
    self._tagItemList = {}          --页签里列表数据
    self._tagNameList = {}          --标签名字
    self._curAuctionInfo = nil      --当前拍卖活动
    self._listViewList = {}         --listView管理
    self._bResizeArray = {          --强制刷新listView
        true,true,true,true
    }         
    self._bDefaultListViewFirstShow = true --默认列表初始需要resize

    local resource = {
        file = Path.getCSB("TenJadeAuctionView", "tenJadeAuction"),
        size =  G_ResolutionManager:getDesignSize(),
        binding = {
            _btnBid = {
				events = {{event = "touch", method = "_onBtnBidClicked"}}
			},
            _btnMail =  {
                events = {{event = "touch", method = "_onBtnMail"}}
            }
		}
    }
	self:setName("TenJadeAuctionView")
    
    
    TenJadeAuctionView.super.ctor(self, resource)
end

function TenJadeAuctionView:onCreate()
    self:_initUI()
    self:_initListView()
end

function TenJadeAuctionView:onEnter()
    local curAuctionInfo = G_UserData:getTenJadeAuction():getCurAuctionInfo()
    if curAuctionInfo then
        G_UserData:getTenJadeAuction():c2sGetCrossAuctionInfo(curAuctionInfo:getAuction_id())
    else
        self:_showAuctionEndView()
        return
    end
    self:_updateData()
    self:_updateView()
    self:_updateTabList()
    self:_startTimer()

    G_AudioManager:playMusicWithId(AudioConst.SOUND_TEN_JADE_AUCTION_BGM)
    
    self._signalAuctionUpdateItem =G_SignalManager:add(SignalConst.EVENT_CROSS_AUCTION_UPDATE_ITEM,
                                        handler(self, self._onEventAuctionUpdateItem))
    self._signalAuctionAddFocus =G_SignalManager:add(SignalConst.EVENT_CROSS_AUCTION_ADD_FOCUS,
                                        handler(self, self._onEventAuctionAddFocus))
    self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, 
                                        handler(self,self._onEventRedPointUpdate))
    self._signalAuctionGetInfo = G_SignalManager:add(SignalConst.EVENT_CROSS_AUCTION_GET_INFO, 
                                        handler(self,self._onEventAuctionGetInfo))
    self._signalAuctionAddPrice = G_SignalManager:add(SignalConst.EVENT_CROSS_AUCTION_ADD_PRICE, 
                                        handler(self,self._onEventAuctionAddPrice))     
    -- self._signalLoginSuccess = G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS,
    --                                     handler(self, self._onEventLoginSuccess))                                   
end

function TenJadeAuctionView:onExit()
    if self._signalAuctionUpdateItem then
        self._signalAuctionUpdateItem:remove()
        self._signalAuctionUpdateItem = nil
    end
    if self._signalAuctionAddFocus then
        self._signalAuctionAddFocus:remove()
        self._signalAuctionAddFocus = nil
    end
    if self._signalRedPointUpdate then
        self._signalRedPointUpdate:remove()
        self._signalRedPointUpdate = nil
    end
    if self._signalAuctionGetInfo then
        self._signalAuctionGetInfo:remove()
        self._signalAuctionGetInfo = nil
    end

    if self._signalAuctionAddPrice then
        self._signalAuctionAddPrice:remove()
        self._signalAuctionAddPrice = nil
    end
    
    -- if self._signalLoginSuccess then
    --     self._signalLoginSuccess:remove()
    --     self._signalLoginSuccess = nil
    -- end
    
    self:_stopTimer()
    
    if self._curAuctionInfo then
        G_UserData:getTenJadeAuction():c2sCrossAuctionLeave(self._curAuctionInfo:getAuction_id())
    end
end

--数据更新
function TenJadeAuctionView:_updateData()
    self._tagItemList = TenJadeAuctionDataHelper.getItemList()
    self._tagNameList = G_UserData:getTenJadeAuction():getTagNameList()
    self._curAuctionInfo = G_UserData:getTenJadeAuction():getCurAuctionInfo()
    local focusList = self._tagItemList[#self._tagItemList].list
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    if #focusList > 0 and 
        self._bDefaultListViewFirstShow and 
        (phase == TenJadeAuctionConst.PHASE_ITEM_SHOW or phase == TenJadeAuctionConst.PHASE_START) then
        --活动开始后 有关注列表默认选关注
        self._selectTabIndex = #self._tagItemList
    end
    
    local dataList = self._tagItemList[self._selectTabIndex].list
    --self._dataList = self._tagItemList[self._selectTabIndex].list
    self._dataList = TenJadeAuctionDataHelper.sort(dataList)
end

--------------------------------------------------------------
----------------------------UI-------------------------------
--------------------------------------------------------------
--初始化ui
function TenJadeAuctionView:_initUI()
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_TEN_JADE_AUCTION)
    self._topbarBase:setImageTitle("txt_sys_yiwanqipai")

    self._labelTimeTitle:setString(Lang.get("ten_jade_auction_time_title"))
    self._widthMax = self._listView:getContentSize().width
    self._labelFocusTip:setString(Lang.get("ten_jade_auction_no_focus_tip"))
    self._labelEndTip:setString(Lang.get("ten_jade_auction_is_over"))
    
    self._btnMail:updateUI(FunctionConst.FUNC_MAIL_RED)
    self._btnMail:setVisible(false)
    self._btnMail:setLocalZOrder(10)
    self:_updateMailShow()
    
    local UIActionHelper = require("app.utils.UIActionHelper")
    UIActionHelper.playBlinkEffect(self._btnBid, 
        {opacity1 = 255, opacity2 = 255}, 
        {scale1=0.9, scale2=1.0},
        1.0)
end

--刷新view
function TenJadeAuctionView:_updateView()
    self:_updateCurList()
    self:_updateItems(true)
    self:_putListViewMiddle()
    self:_updateFocusTips()
end

-- 更新标签
function TenJadeAuctionView:_updateTabList()
    self._nodeTabRoot:setCustomColor({
            {cc.c3b(0xf4, 0xb1, 0x80)},
            {cc.c3b(0x86, 0x44, 0x23)},
        })
    local param = {
        callback = handler(self, self._onTabSelect),
        textList = self._tagNameList,
        isVertical = 2,
        offset = 0
    }
    local offset = 0.5 * TAB_ITEM_WIDTH * (#self._tagNameList - 2)
    self._nodeTabRoot:setPositionX(self._widthMax / 2 - offset)
    self._nodeTabRoot:recreateTabs(param)
    self._nodeTabRoot:setTabIndex(self._selectTabIndex)
end

--根据阶段刷新ui
function TenJadeAuctionView:_updateWihtPhase(phase)
    if phase == TenJadeAuctionConst.PHASE_SHOW then
        --展示阶段
        local startTime = G_UserData:getTenJadeAuction():getCurAuctionStartTime()
        self._labelTime:setString(G_ServerTime:getLeftSecondsString(startTime))
        self._labelTimeTitle:setVisible(true)
        self._labelTime:setVisible(true)
        self._btnBid:setVisible(false)
        self._labelEndTip:setVisible(false)
    elseif phase == TenJadeAuctionConst.PHASE_ITEM_SHOW then
        self._labelTimeTitle:setVisible(false)
        self._labelTime:setVisible(false)
        self._btnBid:setVisible(false)
        self._labelEndTip:setVisible(false)
    elseif phase == TenJadeAuctionConst.PHASE_START then
        --拍卖阶段
        self._labelTimeTitle:setVisible(false)
        self._labelTime:setVisible(false)
        self._btnBid:setVisible(true)
        self._labelEndTip:setVisible(false)
    elseif phase == TenJadeAuctionConst.PHASE_END or 
           phase == TenJadeAuctionConst.PHASE_DEFAULT then
        --结束了
        self:_stopTimer()
        self._labelEndTip:setVisible(true)
        self._labelFocusTip:setVisible(false)
        --local logPanel = TenJadeAuctionLogNode.new()
        --self._nodeLog:addChild(logPanel)
    end
end

--listview 小于6个居中
function TenJadeAuctionView:_putListViewMiddle()
    local curListView = self:_getCurListView()
    local itemCount = #self._dataList
    if itemCount <= 5 then
        curListView:setBounceEnabled(false)
        local x = (self._widthMax - ITEM_WIDTH * itemCount) / 2
        curListView:setPositionX(x)
    else
        curListView:setBounceEnabled(true)
        curListView:setPositionX(0)
    end
end

--更新关注tips
function TenJadeAuctionView:_updateFocusTips()
    if self._selectTabIndex == #self._tagNameList then
        --关注列表
        local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
        if phase == TenJadeAuctionConst.PHASE_END or phase == TenJadeAuctionConst.PHASE_DEFAULT then
            self._labelFocusTip:setVisible(false) 
        else
            self._labelFocusTip:setVisible(#self._dataList == 0)
        end
    else
        self._labelFocusTip:setVisible(false)
    end
end

--邮件显示
function TenJadeAuctionView:_updateMailShow( ... )
    local RedPointHelper = require("app.data.RedPointHelper")
    local visible =  RedPointHelper.isModuleReach(FunctionConst.FUNC_MAIL)
    self._btnMail:setVisible(visible)
    if visible and visible == true then
        self._btnMail:showRedPoint(true)
        self._btnMail:playFuncGfx()
    end
end

--活动结束
function TenJadeAuctionView:_showAuctionEndView()
    for i, view in pairs(self._listViewList) do
        view:setVisible(false)
        view:stopAutoScroll()
    end
    self._labelEndTip:setVisible(true)
    self._labelFocusTip:setVisible(false)
end

------------------------↓↓↓↓↓listView相关↓↓↓↓↓-------------------------
--初始化列表
function TenJadeAuctionView:_initListView()
    local scrollParam = {
        template = TenJadeAuctionCell,
        updateFunc = handler(self, self._onItemUpdate),
        selectFunc = handler(self, self._onItemSelected),
        touchFunc = handler(self, self._onItemTouch),
        bind = "ListView", --横向列表需要绑定ListView
    }
    --self._tabListView = TabScrollView.new(self._listView, scrollParam)
    self._listView:setTemplate( scrollParam.template)
    self._listView:setCallback( scrollParam.updateFunc,scrollParam.selectFunc, scrollParam.scrollFunc)
    self._listView:setCustomCallback(scrollParam.touchFunc)
    self._listViewList[1] = self._listView
end

--通过tab索引获取listView
function TenJadeAuctionView:_getListView(index, scrollParam)
    for i, view in pairs(self._listViewList) do
        view:setVisible(false)
        view:stopAutoScroll()
    end

    local bNewList = false
    local listView = self._listViewList[index]
    if listView == nil then
        listView = self:_createListView(scrollParam)
        self._listViewList[index] = listView
        bNewList = true
    end
    
    bNewList = self._bResizeArray[index] 
    self._bResizeArray[index] = false
    return listView, bNewList
end

--创建新listView
function TenJadeAuctionView:_createListView(scrollParam)
    local root = self._listView:getParent()
    if root == nil then
        return
    end
    local listView = self._listView:clone()
    cc.bind(listView, scrollParam.bind)
    listView:removeAllItems()
    listView:setTemplate( scrollParam.template)
    listView:setCallback( scrollParam.updateFunc,scrollParam.selectFunc, scrollParam.scrollFunc)
    listView:setCustomCallback(scrollParam.touchFunc)
    root:addChild(listView)

    return listView
end

--更新列表
function TenJadeAuctionView:_updateCurList()
    local scrollViewParam = {
        template = TenJadeAuctionCell,
        updateFunc = handler(self, self._onItemUpdate),
        selectFunc = handler(self, self._onItemSelected),
        touchFunc = handler(self, self._onItemTouch),
        bind = "ListView", --横向列表需要绑定ListView
    }
    local listView, bNewList = self:_getListView(self._selectTabIndex, scrollViewParam)
    listView:setVisible(true)
    if bNewList then
        listView:resize(#self._dataList)
        self._curIndex = nil
        self._lastItem = nil
    end
    if self._bDefaultListViewFirstShow then
        self._bDefaultListViewFirstShow = false
        listView:resize(#self._dataList)
    end
end

-- 更新listView可见的item
function TenJadeAuctionView:_updateItems(bForceResize)
    local curList = self:_getListWithTagIndex(self._selectTabIndex)
    local listView = self:_getCurListView()
    local items = listView:getItems()
    if bForceResize then
        self._curIndex = nil
        self._lastItem = nil
        listView:stopAutoScroll()
        listView:clearAll()
        listView:resize(#curList)
    end
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    if phase == TenJadeAuctionConst.PHASE_END then
        listView:setVisible(false)
    end
    --for _, item in pairs(items) do
        --local tag = item:getTag() + 1
        --local itemData = curList[item:getTag() + 1]
        --if itemData then
            --item:updateUI(item:getTag(), itemData)
        --end
    --end
end

-- 更新item
function TenJadeAuctionView:_updateItemWithItemId(itemId)
    local function getItemIndex(itemId)
        local curList = self:_getListWithTagIndex(self._selectTabIndex)
        for idx, data in pairs(curList) do
            local unitData = data.unitData
            if unitData:getId() == itemId then
                return idx, data
            end
        end
    end
    local index, itemData = getItemIndex(itemId)
    local listView = self:_getCurListView(self._selectTabIndex)

    if not index then
        return
    end
    local items = listView:getItems()
    for _, item in pairs(items) do
        if item:getTag() == index - 1 then
            item:updateUI(item:getTag(), itemData)
            break
        end
    end
end


------------------------↑↑↑↑listView相关↑↑↑↑-----------------------------

--------------------------------------------------------------
----------------------------方法-------------------------------
--------------------------------------------------------------
function TenJadeAuctionView:_startTimer()
    self._scheduleTimeHandler = SchedulerHelper.newSchedule(handler(self, self._updateTimer), 1)
    self:_updateTimer()
end

function TenJadeAuctionView:_stopTimer()
    if self._scheduleTimeHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleTimeHandler)
		self._scheduleTimeHandler = nil
    end
end

--根据页签获取列表
function TenJadeAuctionView:_getListWithTagIndex(index)
    return self._tagItemList[index].list
end

--根据页签获取listView
function TenJadeAuctionView:_getCurListView()
    return self._listViewList[self._selectTabIndex]
end


--确认对话框
function TenJadeAuctionView:_showAuctionDlg(itemAward, addPrice, onOkCallBack)
    local DataConst = require("app.const.DataConst")
    local itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size)
    if itemParams == nil then
        return
    end

    local richList = {}
    local richText1 = Lang.get("ten_jade_auction_add_price",
    {
        --resIcon = Path.getResourceMiniIcon(DataConst.RES_JADE2),
        resNum =  addPrice,
    })
    local numText = "x"..itemParams.size
    if itemParams.size == 1 then
        numText = ""
    end

    local itemOutlineColor = nil
    local itemOutlineSize = 0

    if itemParams.cfg.color == 7 then    -- 金色物品加描边
        itemOutlineColor = Colors.colorToNumber(itemParams.icon_color_outline )
        itemOutlineSize = 2
    end
    
    local richText2 = Lang.get("auciton_buy_item",
    {
        itemName = itemParams.name,
        itemColor = Colors.colorToNumber(itemParams.icon_color),
        outColor = itemOutlineColor,
        itemNum = numText,
        outSize = itemOutlineSize,
    })
    
    table.insert( richList, richText1)
    table.insert( richList, richText2)

    local function onCallBackFunc()
        onOkCallBack(addPrice)
    end

    local PopupAlert = require("app.ui.PopupAlert").new(Lang.get("common_title_notice"),"", onCallBackFunc)
    PopupAlert:addRichTextList(richList)
    PopupAlert:openWithAction()
end


--------------------------------------------------------------
----------------------------回调-------------------------------
--------------------------------------------------------------
--标签回调
function TenJadeAuctionView:_onTabSelect(index, sender, groupData)
    --清理状态
    if self._curIndex then
        self._dataList[self._curIndex].viewData.selected = 0
        self._curIndex = nil
    end
    if self._lastItem then
        self._lastItem:setSelected(false)
        self._lastItem = nil
    end
    
    self._selectTabIndex = index
    self._dataList = self:_getListWithTagIndex(index)
    self:_updateView()
    
	return true
end

--列表回调
function TenJadeAuctionView:_onItemUpdate(item, index)
	local data = self._dataList[index+1]

	if data then
		item:updateUI(index, data)
	end
end

function TenJadeAuctionView:_onItemSelected(item, index)
    
end

function TenJadeAuctionView:_onItemTouch(index, item, data, buttonType)
    if buttonType == 1 then
        if self._lastItem then
            self._lastItem:setSelected(false)
            self._dataList[self._curIndex].viewData.selected = 0
        end
        
        item:setSelected(true)
        self._lastItem = item
        self._curIndex = index + 1
        self._dataList[self._curIndex].viewData.selected = 1
        
        
        --------------
        --self._dataList[self._curIndex].unitData:setNow_buyer(1)
        --local data = self._dataList[self._curIndex]
        --if data then
            --self._lastItem:updateUI(index, data)
        --end
    end
end

--时间刷新
function TenJadeAuctionView:_updateTimer()
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    self:_updateWihtPhase(phase)
end

--竞价按钮
function TenJadeAuctionView:_onBtnBidClicked()
    if not self._curIndex then
        G_Prompt:showTip(Lang.get("ten_jade_auction_no_item"))
        return
    end
    
    local data = self._dataList[self._curIndex].unitData

    local itemId = data:getId()
	local buyerId = data:getNow_buyer()
	local itemAward = data:getItem()
	local addPrice = data:getAdd_price()
	local nowPrice = data:getNow_price()
	local initPrice = data:getInit_price()
	local totalPrice = data:getFinal_price()
    local startTime = data:getStart_time()
   
    local timeLeft = G_ServerTime:getLeftSeconds(startTime)
    if timeLeft > 0 then
		G_Prompt:showTip(Lang.get("auction_time_no_reach"))
		return
    end

    if nowPrice == 0 then
		addPrice = initPrice
    end
    local needPrice = nowPrice + addPrice
    
    local function onOkCallBack(price)
		local UserCheck = require("app.utils.logic.UserCheck")
		local retValue, dlgFunc
        
        if buyerId == G_UserData:getBase():getId() then --顶自己
            retValue, dlgFunc = UserCheck.enoughJade2(addPrice)
            if retValue == false then
                dlgFunc()
                return
            end
        else
            retValue, dlgFunc = UserCheck.enoughJade2(price)
            if retValue == false then
                dlgFunc()
                return
            end
        end

        if self._curAuctionInfo then
    		G_UserData:getTenJadeAuction():c2sCrossAuction(
                self._curAuctionInfo:getAuction_id(), 
                data:getConfig_id(),
                price,
                data:getId()
            )
        end
	end
    
    self:_showAuctionDlg(itemAward, needPrice, onOkCallBack)
end

function TenJadeAuctionView:_onBtnMail( ... )
    local WayFuncDataHelper	= require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MAIL_RED)
    -- G_SocketManager:removeConnect()
end

--更新item
function TenJadeAuctionView:_onEventAuctionUpdateItem(event, itemIds, bForceResize)
    if bForceResize then
        self._bResizeArray = {true, true, true, true}
    end
    if bForceResize or #itemIds > 1 then
        --更新全部item
        self:_updateData()
        self:_updateItems(true)
        self:_putListViewMiddle()
    else
        self:_updateItemWithItemId(itemIds[1])
    end
end

--关注更新
function TenJadeAuctionView:_onEventAuctionAddFocus(event, itemId, state)
    G_Prompt:showTip( state == 1 and 
        Lang.get("ten_jade_auction_tag_name_add_focus_success")
        or
        Lang.get("ten_jade_auction_tag_name_del_focus_success")
    )
    if self._selectTabIndex == #self._tagNameList then
        --更新全部item
        self:_updateData()
        self:_updateItems(true)
        self:_putListViewMiddle()
    else
        self:_updateItemWithItemId(itemId)
    end
end

--重新获取数据
function TenJadeAuctionView:_onEventAuctionGetInfo()
    self:_updateData()
    self:_updateView()
end

--小红点刷新
function TenJadeAuctionView:_onEventRedPointUpdate(id, funcId, param)
    self:_updateMailShow()
end

--出价成功
function TenJadeAuctionView:_onEventAuctionAddPrice(id)
    G_Prompt:showTip(Lang.get("ten_jade_auction_add_price_success"))
end

--登录成功
function TenJadeAuctionView:_onEventLoginSuccess(id)
    local curAuctionInfo = G_UserData:getTenJadeAuction():getCurAuctionInfo()
    if curAuctionInfo then
        G_UserData:getTenJadeAuction():c2sGetCrossAuctionInfo(curAuctionInfo:getAuction_id())
    else
        self:_showAuctionEndView()
        return
    end
end




return TenJadeAuctionView