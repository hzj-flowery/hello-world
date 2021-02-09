--[[
   Description: 历代名将列表cell
   Company: yoka
   Author: chenzhongjie
   Date: 2019-07-12 15:53:07
   LastEditors: chenzhongjie
   LastEditTime: 2019-07-30 17:14:22
]]

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroListItemCell = class("HistoryHeroListItemCell", ListViewCellBase)
local TeamConst = require("app.const.TeamConst")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
local RedPointHelper = require("app.data.RedPointHelper")


--TODO 放到convertType里
local HISTORY_HERO_RES = {{},{},{}, 
	{
		bg 		= "img_historical_hero_fram02",
		frame 	= "img_historical_hero_fram02b",
	},
	{
		bg 		= "img_historical_hero_fram03",
		frame 	= "img_historical_hero_fram03b",
	}
}


function HistoryHeroListItemCell:ctor()
	self._imageSelected  = nil  		
	self._nodeLock 		 = nil  		
	self._textPos 		 = nil
	self._textUnlockLevel= nil
	self._callBackData	 = {}
	
	self._imageIconBg	= nil 	--品质背景
	self._imageHero		= nil	--武将图标
	self._nodeEquip		= nil 	--装备
	self._equipFrame	= nil	--装备框
	self._nodeAwaken	= nil	--觉醒
	self._awakenFrame	= nil 	--觉醒框
	self._nodeSelect	= nil	--选中

	local resource = {
		file = Path.getCSB("HistoryHeroListItemCell", "historyhero"),
	}
	HistoryHeroListItemCell.super.ctor(self, resource)
end

function HistoryHeroListItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self:_updateBaseView(false)

	
	self._heroIcon:setScale(0.8)
	self._heroIcon:setRoundType(true)
	self._heroIcon:setTouchEnabled(false)
	-- local UIActionHelper = require("app.utils.UIActionHelper")
	-- UIActionHelper.playBlinkEffect(self._imageAdd)
end

function HistoryHeroListItemCell:onEnter()
	self:updateUI(self._index)
end

function HistoryHeroListItemCell:onExit()
end

--设置选中/不选中
function HistoryHeroListItemCell:setSelect(bSelected)
	self._nodeSelect:setVisible(bSelected)
	self._heroIcon:showEquipFrame(not bSelected, self._callBackData.data)
	if bSelected then
		self._heroIcon:showRedPoint(false)
	else
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, self._callBackData.data)
		self._heroIcon:showRedPoint(reach)
	end
end

function HistoryHeroListItemCell:_updateBaseView(bVisible)
	self._resourceNode:setVisible(bVisible)
end

-- @Role    Add Icon 
function HistoryHeroListItemCell:_onAddTouch(sender, state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			self:dispatchCustomCallback(self._callBackData)
		end
	end
end


-- @Role	UpdateUI
function HistoryHeroListItemCell:updateUI(data)
	local historyHeroUnitData = data.data
	self:_updateBaseView(true)
	
	self._callBackData = data
	self["_panelTouch"]:setEnabled(true)
	self["_panelTouch"]:setSwallowTouches(false)
	self["_panelTouch"]:setTouchEnabled(true)
	self["_panelTouch"]:addClickEventListenerEx(handler(self, self._onAddTouch))
	self._heroIcon:updateUIWithUnitData(historyHeroUnitData, 1)
	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, historyHeroUnitData)
	self._heroIcon:showRedPoint(reach)
	self:setSelect(data.select)
end


return HistoryHeroListItemCell