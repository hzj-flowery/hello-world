
---=====================================
---VIP 面板
---=====================================

local PopupBase = require("app.ui.PopupBase")
local VipView = class("VipView", PopupBase)

local VipRechargeView = require("app.scene.view.vip.VipRechargeView")
local VipPrivilegeView = require("app.scene.view.vip.VipPrivilegeView")
local VipLevel = require("app.config.vip_level")
local VipGiftPkgNode = require("app.scene.view.vip.VipGiftPkgNode")
local DataConst = require("app.const.DataConst")

VipView.TAB_INDEX_JADE      = 1 --玉璧
--VipView.TAB_INDEX_RECHARGE  = 2 --充值
VipView.TAB_INDEX_PRIVILEGE = 2--3 --特权


function VipView:ctor(initTabIndex, roundEffectList)
	self._resourceNode = nil
	self._privilegeNode = nil
	self._privilegePageView = nil
    self._rechargeView = nil
    self._jadeNodeView = nil
    self._comomPop = nil

    self._selectTabIndex = initTabIndex or 1
	self._roundEffectList = roundEffectList
    self._vipGiftPkgNode = nil

	self._vipList  = {}
	self._maxVipShowLevel = nil
    self._commonVipNode = nil
	local resource = {
		file = Path.getCSB("PopupVip", "vip"),
		size = {1136, 640},
		binding = {

		}
	}
	VipView.super.ctor(self, resource,true)
end

function VipView:onCreate()
    self._popBase:setTitle(Lang.get("lang_vip_recharge_btn"))
	self._popBase:addCloseEventListener(handler(self, self.onBtnCancel))
	
	self._vipGiftPkgNode = VipGiftPkgNode.new(self._vipGiftPkg)
	cc.bind(self._commonProgressNode,"CommonProgressNode")

	local privilegePageView = self._nodePageView:getSubNodeByName("PageView_privilege")
	cc.bind(privilegePageView,"CommonPageView")
    self:_initTab()
end

function VipView:onEnter()
	self:_initView()
	self._getVipGift = G_SignalManager:add(SignalConst.EVENT_VIP_GET_VIP_GIFT_ITEMS, handler(self, self._onEventGetVipGift))
	self._signalRedPointChange = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointChange))
	self._signalRechargeGetInfo = G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventRechargeGetInfo ))
end

function VipView:onExit()
	self._privilegePageView = nil
    self._rechargeView = nil
    self._jadeNodeView = nil

	self._getVipGift:remove()
	self._getVipGift = nil

	self._signalRedPointChange:remove()
	self._signalRedPointChange = nil

	self._signalRechargeGetInfo:remove()
	self._signalRechargeGetInfo = nil
end

function VipView:_initTab( ... )
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    self._isOpenJade = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)
    --self._imageRopeTail:setPositionY(self._isOpenJade and 170 or 300)
    self._imageRope3:setVisible(false)--self._isOpenJade)
    self._nodeTabIcon3:setNodeVisible(false)--self._isOpenJade)

    self._tabNum = 2--self._isOpenJade and 3 or 2
    for i = 1, self._tabNum do
        local nameStr, idx = Lang.get("vip_tab_" ..i), i
        --[[if not self._isOpenJade then
            idx = (i + 1)
            nameStr = Lang.get("vip_tab_" ..idx)
        end]]
        self["_nodeTabIcon" .. i]:updateUI(nameStr, true, idx)
        self["_nodeTabIcon" .. i]:setCallback(handler(self, self._onClickTabIcon))
    end
    
    self:_updateTabSelected()
end

function VipView:_onClickTabIcon(index)
	if index == self._selectTabIndex then
		return
    end
    
	self._selectTabIndex = index
    self:_updateTabSelected()
    self:updateView()

    --[[if index == VipView.TAB_INDEX_RECHARGE then
        self:switch2Recharge()
    else]]if index == VipView.TAB_INDEX_PRIVILEGE then
        self:_switch2Privilege()
    elseif index == VipView.TAB_INDEX_JADE then
        self:_switch2Jade()
    end
end

function VipView:_updateTabSelected()
    for i = 1, self._tabNum do
        local idx = i
        if not self._isOpenJade then
            idx = (i + 1) --== 2 and 3 or i
        end
		self["_nodeTabIcon" .. i]:setSelected(idx == self._selectTabIndex)
	end
end

function VipView:onShowFinish()
	G_UserData:getVip():c2sGetRecharge()
end


function VipView:onBtnCancel()
	self:close()
end


function VipView:_onEventRechargeGetInfo(id, message)
	if self._selectTabIndex == VipView.TAB_INDEX_PRIVILEGE then
		self:_switch2Privilege()
	end
end

function VipView:_onEventRedPointChange(id, funcId)
	--[[if self._selectTabIndex == VipView.TAB_INDEX_RECHARGE then
		--local RedPointHelper = require("app.data.RedPointHelper")
        --local redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECHARGE)
        self._nodeTabIcon1:showRedPoint(false)
	end]]
	if funcId == FunctionConst.FUNC_VIP_GIFT then
		self:updateLeftBtnRedPoint()
	end
end

function VipView:updateLeftBtnRedPoint()
	if self._privilegePageView == nil then
		return
	end
	local currLevel = self._privilegePageView:getCurrentPageIndex()
	local showRedPoint = G_UserData:getVip():hasGiftInLeftPage(currLevel-1)
	self._btnLeftRedPoint:setVisible(showRedPoint)
	showRedPoint = G_UserData:getVip():hasGiftInRightPage(currLevel+1)
	local showRedPoint = G_UserData:getVip():hasGiftInLeftPage(currLevel-1)
	self._btnLeftRedPoint:setVisible(showRedPoint)
	showRedPoint = G_UserData:getVip():hasGiftInRightPage(currLevel+1)
	self._btnRightRedPoint:setVisible(showRedPoint)
end

function VipView:_onEventGetVipGift(id, message)
	if self._selectTabIndex ~= VipView.TAB_INDEX_PRIVILEGE then
		return
	end

	if message.ret ~= 1 then
		return
	end
	--显示奖励
	local awards = rawget(message, "reward") or {}
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(awards)
	 
	-----------------------------------
	local currLevel = self._privilegePageView:getCurrentPageIndex()
	local vipData = G_UserData:getVip():getVipDataByLevel(currLevel)
	local currentPage = self._privilegePageView:getItemEx(currLevel)
	if currentPage then
		currentPage:updateUI(vipData)
	end

	self:_refreshVipGiftPkg(currLevel)
end

function VipView:_initView()
	self._nodePageView:updateButton("Button_turn_left", function ()
		local currentPage = self._privilegePageView:getCurrentPageIndex()
		if currentPage > 0 then
			self._privilegePageView:scrollToPageEx(currentPage - 1)
		end	
	end)

	self._nodePageView:updateButton("Button_turn_right", function ()
		local currentPage = self._privilegePageView:getCurrentPageIndex()
		local pageSize = self._privilegePageView:getPageSize()
		if currentPage + 1 < pageSize then
			self._privilegePageView:scrollToPageEx(currentPage + 1)
		end
	end)

    self._nodeView:setVisible(false)--self._selectTabIndex == VipView.TAB_INDEX_RECHARGE)
    self._nodePageView:setVisible(self._selectTabIndex == VipView.TAB_INDEX_PRIVILEGE)
    self._jadeView:setVisible(self._selectTabIndex == VipView.TAB_INDEX_JADE)

	--[[if self._selectTabIndex == VipView.TAB_INDEX_RECHARGE then
		self:switch2Recharge()
	else]]if self._selectTabIndex == VipView.TAB_INDEX_PRIVILEGE then
        self:_switch2Privilege()
    elseif self._selectTabIndex == VipView.TAB_INDEX_JADE then
        self:_switch2Jade()
	end
    self:updateView()
    self:_updateRedPoint()
end

function VipView:_updateRedPoint( ... )
    -- body
    local RedPointHelper = require("app.data.RedPointHelper")
	local redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECHARGE)
    --[[if self._isOpenJade then
        self._nodeTabIcon1:showRedPoint(false)
        self._nodeTabIcon2:showRedPoint(false)
        self._nodeTabIcon3:showRedPoint(redValue)
    else]]
        self._nodeTabIcon1:showRedPoint(false)
        self._nodeTabIcon2:showRedPoint(redValue)
    --end
end

function VipView:_initPrivilegeView()
	self._resourceNode:updateButton("Button_turn_left", function ()
		local currentPage = self._privilegePageView:getCurrentPageIndex()
		if currentPage > 0 then
			self._privilegePageView:scrollToPageEx(currentPage - 1)
			self:_refreshVipGiftPkg(currentPage - 1)
		end
	end)

	self._resourceNode:updateButton("Button_turn_right", function ()
		local currentPage = self._privilegePageView:getCurrentPageIndex()
		local pageSize = self._privilegePageView:getPageSize()
		if currentPage + 1 < pageSize then
			self._privilegePageView:scrollToPageEx(currentPage + 1)
			self:_refreshVipGiftPkg(currentPage + 1)
		end
	end)

	self._privilegeNode = self._resourceNode:getSubNodeByName("Node_privilege")
	self._privilegeNode:setVisible(false)
end

---顶部基础信息
function VipView:updateView()
	local VipLevelInfo = require("app.config.vip_level")
	local maxVipLv = G_UserData:getVip():getShowMaxLevel()

	local currentVipLv = G_UserData:getVip():getLevel()
	local currentVipExp = G_UserData:getVip():getExp()
	local nextVipLv = currentVipLv == maxVipLv and maxVipLv or currentVipLv + 1


	local curVipLvInfo = G_UserData:getVip():getVipDataByLevel(currentVipLv):getInfo()
	local imageVip = self._resourceNode:getSubNodeByName("_nextVipValue")
    local nextGoldValueText1 = self._resourceNode:getSubNodeByName("Text_next_gold_value_1")
    local nextGoldValueText2 = self._resourceNode:getSubNodeByName("Text_next_gold_value_2")
    local nextGoldValueText3 = self._resourceNode:getSubNodeByName("Text_next_gold_value_3")

    local totalWidth    = 0
	if maxVipLv ~= currentVipLv then
		self._resourceNode:getSubNodeByName("Node_level_not_full"):setVisible(true)
		self._resourceNode:updateLabel("_nextVipValue", Lang.get("lang_vip_value", {num = nextVipLv}))
		local expDesc = tostring(currentVipExp) .. "/" .. tostring(curVipLvInfo.vip_exp)
		self._resourceNode:updateLabel("TextProgress", {text = expDesc, visible = true})
		--self._resourceNode:updateImageView("Vip_level",Path.getRechargeVip(currentVipLv))
		self._commonVipNode:setVip(currentVipLv)
        self._resourceNode:updateLabel("Text_level_full", {text = Lang.get("lang_level_full"),visible = false})
        
        nextGoldValueText1:setString(Lang.get("lang_vip_next_level_title_1"))
        nextGoldValueText2:setString(curVipLvInfo.vip_exp - currentVipExp)
        nextGoldValueText3:setString(Lang.get("lang_vip_next_level_title_4"))
        --[[if self._isOpenJade and self._selectTabIndex ~= 1 then
            nextGoldValueText3:setString(Lang.get("lang_vip_next_level_title_5"))
        end
        if self._isOpenJade and self._selectTabIndex == 2 then
            nextGoldValueText3:setString(Lang.get("lang_vip_next_level_title_3"))
        end
        if not self._isOpenJade then
            nextGoldValueText3:setString(Lang.get("lang_vip_next_level_title_3"))
        end]]
        nextGoldValueText3:setPositionX(nextGoldValueText2:getPositionX() + nextGoldValueText2:getContentSize().width + 4)
		-- nextGoldValueText:setString(Lang.get("lang_vip_next_level_title",
        -- 	{value = curVipLvInfo.vip_exp - currentVipExp}))
        
        totalWidth = totalWidth + nextGoldValueText1:getContentSize().width + nextGoldValueText2:getContentSize().width + nextGoldValueText3:getContentSize().width
	else
		self._resourceNode:getSubNodeByName("Node_level_not_full"):setVisible(false)
		--self._resourceNode:updateImageView("Vip_level",Path.getRechargeVip(currentVipLv))
		self._commonVipNode:setVip(currentVipLv)
		self._resourceNode:updateLabel("Text_level_full", {text = Lang.get("lang_level_full"),visible = true})
		self._resourceNode:updateLabel("TextProgress",  {text = tostring(currentVipExp), visible = true})
	end
	--[[
	logWarn("-----------------")
	dump(currentVipExp)
	dump(curVipLvInfo)
	logWarn("-----------------")
]]
    -- imageVip:setPositionX(nextGoldValueText:getPositionX() + nextGoldValueText:getContentSize().width + 4)
    imageVip:setPositionX(nextGoldValueText1:getPositionX() + totalWidth + 8)

	local progressBar = self:getSubNodeByName("LoadingBar")
	progressBar:setPercent(currentVipExp >= curVipLvInfo.vip_exp and  100 or (currentVipExp / curVipLvInfo.vip_exp) * 100)

	self._commonProgressNode:showLightLine(true,currentVipExp,curVipLvInfo.vip_exp)
end

--切换到充值（暂时保留）
function VipView:switch2Recharge()
    if self._rechargeView == nil then
		self._rechargeView = VipRechargeView.new(self, DataConst.RES_DIAMOND, self._roundEffectList)
		self._nodeView:addChild(self._rechargeView)
	end

    self._imageBg:loadTexture(Path.getVipJpgImage("img_vipbg"))
    self._imageBg:ignoreContentAdaptWithSize(true)
	self._nodePageView:setVisible(false)
    self._nodeView:setVisible(true)
    self._jadeView:setVisible(false)	
	
	--local RedPointHelper = require("app.data.RedPointHelper")
	--local redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECHARGE)
    self._nodeTabIcon1:showRedPoint(false)
    self._popBase:setTitle(Lang.get("lang_vip_recharge_btn"))
end

--切换到玉璧
function VipView:_switch2Jade()
	if self._jadeNodeView == nil then
		self._jadeNodeView = VipRechargeView.new(self, DataConst.RES_JADE2, self._roundEffectList)
		self._jadeView:addChild(self._jadeNodeView)
	end

    -- self._imageBg:loadTexture(Path.getVipJpgImage("img_vipbg03"))
    -- self._imageBg:ignoreContentAdaptWithSize(true)
	self._nodePageView:setVisible(false)
    self._nodeView:setVisible(false)
    self._jadeView:setVisible(true)
	
    self._nodeTabIcon2:showRedPoint(false)
    self._popBase:setTitle(Lang.get("lang_vip_recharge_btn"))
end

--切换到特权
function VipView:_switch2Privilege()
	local UserDataHelper = require("app.utils.UserDataHelper")
	local oldVipNum = #self._vipList 
	self._vipList =  UserDataHelper.getVipGiftPkgList()  or {}
	self._maxVipShowLevel = self._vipList[#self._vipList]:getId()
	if #self._vipList == 0 then
		assert(false)
	end

	if self._privilegePageView == nil then ---创建并添加显示到pageview
		self._privilegePageView = self._nodePageView:getSubNodeByName("PageView_privilege")
		self._privilegePageView:setScrollDuration(0.7)
		self._privilegePageView:initPageView(VipPrivilegeView,
			handler(self,self.updateItem),handler(self, self._onPageViewEvent),true)
		self._privilegePageView:refreshPage(self._vipList)

	elseif oldVipNum ~= #self._vipList then
		self._privilegePageView:refreshPage(self._vipList)
	end

	self:_scrollToVipLevel()

    self._imageBg:loadTexture(Path.getVipJpgImage("img_vipbg"))
    self._imageBg:ignoreContentAdaptWithSize(true)
	self._nodePageView:setVisible(true)
    self._nodeView:setVisible(false)
    self._jadeView:setVisible(false)

    local RedPointHelper = require("app.data.RedPointHelper")
	local redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECHARGE)
    --[[if self._isOpenJade then
        self._nodeTabIcon3:showRedPoint(redValue)
    else]]
        self._nodeTabIcon2:showRedPoint(redValue)
    --end
    self._popBase:setTitle(Lang.get("lang_vip_privilege_btn"))
end

function VipView:updateItem(item,i)
	logWarn("########___________ update "..i)
	item:updateUI(self._vipList[i+1])
end

---pageview页码变化
function VipView:_onPageViewEvent(sender, eventType)

    if eventType == ccui.PageViewEventType.turning and sender == self._privilegePageView then
		self:_refreshVipGiftPkg()
    end
end

function VipView:_refreshVipGiftPkg(pageIndex)
	local currLevel = pageIndex or self._privilegePageView:getCurrentPageIndex()

	local vipData = G_UserData:getVip():getVipDataByLevel(currLevel)
	if self._vipGiftPkgNode then
		self._vipGiftPkgNode:updateUI(vipData)
	end
	local maxVipLv = self._maxVipShowLevel  or G_UserData:getVip():getShowMaxLevel()
	self:getSubNodeByName("Button_turn_left"):setVisible(currLevel ~= 0)
	self:getSubNodeByName("Button_turn_right"):setVisible(currLevel < maxVipLv)

	self:updateLeftBtnRedPoint()
end


function VipView:_scrollToVipLevel()
	local vipLevel = G_UserData:getVip():getLevel()
	
	self._privilegePageView:setCurrentPageIndexEx(vipLevel)

	local vipData = G_UserData:getVip():getVipDataByLevel(vipLevel)
	local currentPage = self._privilegePageView:getItemEx(vipLevel)
	if currentPage then
		currentPage:updateUI(vipData)
	end

	self:_refreshVipGiftPkg(vipLevel)
end

function VipView:_onClose()
	self:removeFromParent()
end




return VipView