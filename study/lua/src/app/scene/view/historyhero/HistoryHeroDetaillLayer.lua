
-- Author: conley
-- Date:2018-11-23 17:08:11
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HistoryHeroDetaillLayer = class("HistoryHeroDetaillLayer", ViewBase)
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local HistoryHeroAttrLayer = require("app.scene.view.historyhero.HistoryHeroAttrLayer")
local HistoryHeroTrainAwakeLayer = require("app.scene.view.historyhero.HistoryHeroTrainAwakeLayer")

function HistoryHeroDetaillLayer:ctor()
	self._buttonChange 	   = nil
	self._buttonPageLeft   = nil
	self._buttonPageRight  = nil
	self._buttonUnload	   = nil
	self._textRightLantern = nil
	self._btnBackToMain	   = nil
	self._nodeAvatar	   = nil
	self._textName		   = nil
	self._curTabIndex	   = 1 		-- 当前Tab
	self._heroList		   = {}		-- 名将列表
	self._squadIndex	   = 1		-- 选中坑位
	self._curAvatarIndex   = 1		-- 当前Avatar-Idx

	local resource = {
		file = Path.getCSB("HistoryHeroDetaillLayer", "historyhero"),
		binding = {
			_buttonChange = {
				events = {{event = "touch", method = "_onButtonChange"}}
			},
			_buttonPageLeft = {
				events = {{event = "touch", method = "_onButtonPageLeft"}}
			},
			_buttonPageRight = {
				events = {{event = "touch", method = "_onButtonPageRight"}}
			},
			_buttonUnload = {
				events = {{event = "touch", method = "_onButtonUnload"}}
			},
			_btnBackToMain = {
				events = {{event = "touch", method = "_onBackToHistoriMain"}}
			},
		},
	}
	HistoryHeroDetaillLayer.super.ctor(self, resource)
end

function HistoryHeroDetaillLayer:onCreate()
	self:_initBaseView()
end

function HistoryHeroDetaillLayer:onEnter()
	self._starEquip = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_EQUIP_SUCCESS, handler(self, self._onStarEquip))	   		 -- 武将上下阵

	self._heroList = G_UserData:getHistoryHero():getHeroList()
	self:_initAvatarView()
end

function HistoryHeroDetaillLayer:onExit()
	if self._starEquip then
		self._starEquip:remove()
		self._starEquip = nil
	end
end

function HistoryHeroDetaillLayer:_initBaseView()
	self:_updateLayer()
	self:_initTab()
	self:_updateTitleView()
end

function HistoryHeroDetaillLayer:_updateTitleView()
	self._textName:setString(Lang.get("historyhero_type_"..self._curTabIndex))
end

-- @Role 	Init Avatar
function HistoryHeroDetaillLayer:_initAvatarView()
	if self._heroList == nil or rawget(self._heroList, 1) == nil then
		self._buttonPageRight:setEnabled(false)
		self._buttonPageLeft:setEnabled(false)
		return
	end
	self._buttonPageRight:setEnabled(self._curAvatarIndex < #self._heroList)
	self._buttonPageLeft:setEnabled(self._curAvatarIndex > 1)
	self:_updateAvatarView()
end

-- @Role 	Update Avatar
function HistoryHeroDetaillLayer:_updateAvatarView()
	if self._heroList == nil or rawget(self._heroList, 1) == nil then
		return
	end

	if self._heroList[self._curAvatarIndex]:getSystem_id() == 0 then
		return
	end
	self._nodeAvatar:updateUI(self._heroList[self._curAvatarIndex]:getSystem_id())
	self._nodeAvatar:setScale(1.2)
	self["_historyDetail"..self._curTabIndex]:updateUI(self._heroList[self._curAvatarIndex])
	self:_updateRedPoint()
	self:_updateTab()
end

-- @Role	Init Table
function HistoryHeroDetaillLayer:_initTab()
	for index = 1, 3 do
		local txt = Lang.get("historyhero_tab_icon_"..index)
		self["_nodeTab"..index]:updateUI(txt, self._curTabIndex == index, index)
		self["_nodeTab"..index]:setClickCallback(handler(self, self._onClickTabIcon))
		self["_historyDetail"..index]:setVisible(self._curTabIndex == index)
	end
end

-- @Role 	刷新Table
function HistoryHeroDetaillLayer:_updateTab()
	local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
	local heroInfo = HistoryHeroDataHelper.getHistoryHeroInfo(self._heroList[self._curAvatarIndex]:getSystem_id())
	if heroInfo == nil then
		return
	end
	
	-- Show Right Tab
	self._iamgeTab1:setVisible(heroInfo.is_step == HistoryHeroConst.BREAK_STATE_1)
	self._iamgeTab2:setVisible(heroInfo.is_step == HistoryHeroConst.BREAK_STATE_0)
	self._nodeTab3:setVisible(heroInfo.is_step == HistoryHeroConst.BREAK_STATE_1)

	-- Special TrunBack <——
	if heroInfo.is_step == HistoryHeroConst.BREAK_STATE_0 then
		if self._curTabIndex == HistoryHeroConst.TAB_TYPE_BREAK then
			self:_onClickTabIcon(HistoryHeroConst.TAB_TYPE_DETAIL)
		end
	end
end

-- @Role 	选择Table
function HistoryHeroDetaillLayer:_onClickTabIcon(index)
	if self._curTabIndex == index then
		return
	end
	self._curTabIndex = index
	G_UserData:getHistoryHero():setDetailTabType(self._curTabIndex)
	self:_updateLayer()
	self:_updateTitleView()
	for i = 1, 3 do
		self["_historyDetail"..i]:setVisible(self._curTabIndex == i)
	end
	self["_historyDetail"..self._curTabIndex]:updateUI(self._heroList[self._curAvatarIndex])
end

-- @Role 	Table对应的选择状态
function HistoryHeroDetaillLayer:_updateLayer()
	for index = 1, 3 do		
		self["_nodeTab"..index]:setSelected(self._curTabIndex == index)		
		self["_historyDetail"..index]:setNodeVisible(self._curTabIndex == index)
	end
end

function HistoryHeroDetaillLayer:_updateRedPoint()
	local bcannotChange, state = self:_isCanChange()
	self["_imageChangeRP"]:setVisible(bcannotChange)
	self["_imageUnloadRP"]:setVisible(not bcannotChange and state ~= HistoryHeroConst.TYPE_EQUIP_0)
end

-------------------------------------------------------
-- @Role 	切换视图
-- @Param 	bSwitch 是否切刀主界面
function HistoryHeroDetaillLayer:switchHistoryMainView(bSwitch)
	self._buttonPageLeft:setVisible(not bSwitch)
	self._buttonPageRight:setVisible(not bSwitch)
	self._nodeButton:setVisible(not bSwitch)
	self._nodeAvatar:setVisible(not bSwitch)
end

-- @Export 		Lantern Name
-- @Param		bShow 是否在主页显示
function HistoryHeroDetaillLayer:updateLanternName(bShow)
	local straName = bShow and Lang.get("historyhero_strength") or Lang.get("historyhero_back")
	self._textRightLantern:setString(straName)
end

-- @Export 		Listenter ShowHide
function HistoryHeroDetaillLayer:showHideCallBack(callback)
	self._showHideDetailCallback = callback
end

-- @Export 		Synchro Slot（暂弃）
function HistoryHeroDetaillLayer:synchroSquadSlot(slot, synchroSlot)
	self._squadIndex = slot
	self._synchroSlotCallBack = synchroSlot
end

-- @Export 		Strength AvatarIdx
function HistoryHeroDetaillLayer:strengthAvatarIdx(index)
	self._curAvatarIndex = index
	self._buttonPageLeft:setEnabled(self._curAvatarIndex > 1)
	self._buttonPageRight:setEnabled(self._curAvatarIndex < #self._heroList)
	self:_updateAvatarView()
end

------------------------------------------------------------------------------------
-- @Role		更换成功
function HistoryHeroDetaillLayer:_onStarEquip(id, message)
	self:_updateRedPoint()
end

------------------------------------------------------------------------------------
-- @Rolef 	更换上阵名将
function HistoryHeroDetaillLayer:_onButtonChange()
	if historyHeroIds == nil or table.nums(historyHeroIds) <= 0 then
		return
	end

	local bExist, state = self:_isCanChange()
	if bExist and state == HistoryHeroConst.TYPE_EQUIP_1 then
		G_Prompt:showTip(Lang.get("historyhero_exchange_exist"))
		return
	elseif bExist and state == HistoryHeroConst.TYPE_EQUIP_2 then
		G_Prompt:showTip(Lang.get("historyhero_exchange_exist_notsame"))
		return
	end

	if #historyHeroIds < self._squadIndex then
		self._squadIndex = (#historyHeroIds + 1)
	end

	local UIConst = require("app.const.UIConst")
	G_Prompt:playTotalPowerSummary()
	G_UserData:getHistoryHero():c2sStarEquip(self._heroList[self._curAvatarIndex]:getId(), self._squadIndex - 1)
end

-- @Role 	卸下上阵名将
function HistoryHeroDetaillLayer:_onButtonUnload()
	if self._squadIndex == nil and self._squadIndex < 1 then
		return
	end 

	local bCanUnLoad = false
	local slot = 0
	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()
	for key, value in pairs(historyHeroIds) do
		if value == self._heroList[self._curAvatarIndex]:getId() then
			bCanUnLoad = true
			slot = key
			break
		end
	end

	if bCanUnLoad and self._squadIndex == slot then
		G_UserData:getHistoryHero():c2sStarEquip(0, self._squadIndex - 1)
	elseif bCanUnLoad and self._squadIndex ~= slot then
		self._squadIndex = slot
		G_UserData:getHistoryHero():c2sStarEquip(0, slot - 1)
	else
		G_Prompt:showTip(Lang.get("historyhero_unload_nil"))
	end
end

-- @Role 	向左
function HistoryHeroDetaillLayer:_onButtonPageLeft()
	if self._heroList == nil then
		return
	end
	if self._curAvatarIndex <= 1 then
		return
	end
	self._curAvatarIndex = (self._curAvatarIndex - 1)
	self._buttonPageLeft:setEnabled(self._curAvatarIndex > 1)
	self._buttonPageRight:setEnabled(self._curAvatarIndex < #self._heroList)
	self:_updateAvatarView()
end

-- @Role	向右
function HistoryHeroDetaillLayer:_onButtonPageRight()
	if self._heroList == nil then
		return
	end

	if self._curAvatarIndex >= #self._heroList then
		return
	end
	self._curAvatarIndex = (self._curAvatarIndex + 1)
	self._buttonPageRight:setEnabled(self._curAvatarIndex < #self._heroList)
	self._buttonPageLeft:setEnabled(self._curAvatarIndex > 1)
	self:_updateAvatarView()
end

-- @Role 	返回
function HistoryHeroDetaillLayer:_onBackToHistoriMain()
	if self._heroList == nil or next(self._heroList) == nil then
		G_Prompt:showTip(Lang.get("historyhero_strength_empty"))
		return
	end
	if self._heroList[1] and self._heroList[1]:getId() == 0 then
		G_Prompt:showTip(Lang.get("historyhero_strength_empty"))
		return
	end
	if self._showHideDetailCallback then
		self._showHideDetailCallback()
	end
end

--------------------------------------------------------
-- @Role 	是否可更换
function HistoryHeroDetaillLayer:_isCanChange()
	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()
	if historyHeroIds == nil or self._squadIndex == nil then
		return false, HistoryHeroConst.TYPE_EQUIP_0
	end

	for key, value in pairs(historyHeroIds) do
		if value == self._heroList[self._curAvatarIndex]:getId() then
			if key == self._squadIndex then
				return false, HistoryHeroConst.TYPE_EQUIP_1 -- 存在：同位置
			else
				return false, HistoryHeroConst.TYPE_EQUIP_2 -- 存在：不同位置
			end			
		end
	end
	return true, HistoryHeroConst.TYPE_EQUIP_0
end



return HistoryHeroDetaillLayer