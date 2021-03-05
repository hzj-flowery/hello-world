-- 
local ViewBase = require("app.ui.ViewBase")
local CustomActivityTenJadeAuction = class("CustomActivityTenJadeAuction", ViewBase)
local SchedulerHelper = require("app.utils.SchedulerHelper")
local TenJadeAuctionConfigHelper = import("app.scene.view.tenJadeAuction.TenJadeAuctionConfigHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")

function CustomActivityTenJadeAuction:ctor(parentView)
	self._parentView = parentView

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityTenJadeAuction", "customactivity"),
		binding = {
            _buttonGo = {
                events = {{event = "touch", method = "_onBtnGoOnClick"}}
            }
		},
	}
	CustomActivityTenJadeAuction.super.ctor(self, resource)
end

function CustomActivityTenJadeAuction:onCreate()
	self:_initData()
	self:_initView()
end

function CustomActivityTenJadeAuction:_initData()
end

function CustomActivityTenJadeAuction:_initView()
	
end

function CustomActivityTenJadeAuction:onEnter()
    self._textTimeTitle:setString(Lang.get("ten_jade_auction_activity_time_title"))
    self._buttonGo:setString(Lang.get("ten_jade_auction_buy_now"))
	self:_startCountDown()
    self:_updateShowItem()
end

function CustomActivityTenJadeAuction:onExit()
	self:_stopCountDown()
end

function CustomActivityTenJadeAuction:refreshView()
end

function CustomActivityTenJadeAuction:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function CustomActivityTenJadeAuction:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

--限时活动展示道具icon
function CustomActivityTenJadeAuction:_updateShowItem()
    for i = 1, 4 do
        local type, value = TenJadeAuctionConfigHelper.getShowItem(i)
        self["_commonIcon" .. i]:unInitUI()
        self["_commonIcon" .. i]:initUI(type, value, 1)
        self["_commonIcon" .. i]:setImageTemplateVisible(true)
        self["_commonIcon" .. i]:setTouchEnabled(true)
    end
end


-------------------------------------------------------------------
-----------------------------回调----------------------------------
-------------------------------------------------------------------
function CustomActivityTenJadeAuction:_onCountDown()
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    if phase == TenJadeAuctionConst.PHASE_SHOW then
        --展示阶段
        local startTime = G_UserData:getTenJadeAuction():getCurAuctionStartTime()
        self._textTime:setString(G_ServerTime:getLeftSecondsString(startTime))
    elseif phase == TenJadeAuctionConst.PHASE_ITEM_SHOW then
        self._textTimeTitle:setPositionX(196)
        self._textTimeTitle:setString(Lang.get("ten_jade_auction_is_start"))
        self._textTime:setVisible(false)
    elseif phase == TenJadeAuctionConst.PHASE_START then
        self._textTimeTitle:setPositionX(196)
        self._textTimeTitle:setString(Lang.get("ten_jade_auction_is_start"))
        self._textTime:setVisible(false)
    elseif phase == TenJadeAuctionConst.PHASE_END or
        phase == TenJadeAuctionConst.PHASE_DEFAULT then
        --结束了
        self:_stopCountDown()
        self._textTimeTitle:setPositionX(196)
        self._textTimeTitle:setString(Lang.get("ten_jade_auction_is_over"))
        self._textTime:setVisible(false)
    end
end

--前往按钮
function CustomActivityTenJadeAuction:_onBtnGoOnClick()
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    if phase == TenJadeAuctionConst.PHASE_END or
        phase == TenJadeAuctionConst.PHASE_DEFAULT then
        G_Prompt:showTip(Lang.get("ten_jade_auction_is_over"))
        return
    end
    
    
    self._parentView:close()
    
    local FunctionConst = require("app.const.FunctionConst")
    local WayFuncDataHelper	= require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_TEN_JADE_AUCTION)
end

return CustomActivityTenJadeAuction