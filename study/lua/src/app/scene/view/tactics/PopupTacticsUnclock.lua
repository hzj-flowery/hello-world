--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法位解锁选择武将界面
local PopupBase = require("app.ui.PopupBase")
local PopupTacticsUnclock = class("PopupTacticsUnclock", PopupBase)
local PopupTacticsUnclockCell = require("app.scene.view.tactics.PopupTacticsUnclockCell")
local PopupCheckHeroHelper = require("app.ui.PopupCheckHeroHelper")
local TacticsConst = require("app.const.TacticsConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")


function PopupTacticsUnclock:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupTacticsUnclock", "tactics"),
		binding = {
			_btnUnlock = {
				events = {{event = "touch", method = "_onButtonUnlock"}}
			},
		}
	}
	self:setName("PopupTacticsUnclock")
	PopupTacticsUnclock.super.ctor(self, resource)
end

function PopupTacticsUnclock:onCreate()
	self._commonNodeBk:setTitle(Lang.get("tactics_unlock_position"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
    
    self._btnUnlock:setString(Lang.get("tactics_unlock_tip"))
	self._fileNodeDes2:updateUI(Lang.get("tactics_unlock_pos_click_tip"), "")
	
    -- self._fileNodeDes1:setDesColor(Colors.TacticsActiveColor)
	self._fileNodeDes1:setValueColor(Colors.TacticsActiveColor)
	self._fileNodeDes1:setMaxColor(Colors.TacticsActiveColor)
	self._fileNodeDes1:setFontSize(20)
	self._fileNodeDes2:setFontSize(20)

	self._selectList = {} 	-- 选中的数据
	self._maxNum = 2 		-- 选中最大数量
end

function PopupTacticsUnclock:onEnter()

end

function PopupTacticsUnclock:onExit()

end

function PopupTacticsUnclock:updateUI(pos, slot, clickOk)
    self._clickOk = clickOk

	local needColor, needNum, needCost = require("app.utils.data.TacticsDataHelper").getTacticsPosUnlockParam(slot)
    self._herosData = G_UserData:getHero():getHeroByTacticsPosUnlock(slot)
    
	self._maxNum = needNum
	self._cost = needCost
	
	local colorTip = Lang.get("lang_sellfragmentselect_quality_" .. needColor)
	local color = Colors.COLOR_QUALITY[needColor]
    local colorStr =  Colors.toHexStr(color)
	local outlineColor = Colors.COLOR_QUALITY_OUTLINE[needColor]
    local outlineColorStr =  Colors.toHexStr(outlineColor)
	local outlineSize = 0
	if needColor==7 then
		outlineSize = 2
		colorTip = " " .. colorTip .. " "
	end

	local params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
	local tipStr = Lang.get("tactics_unlock_pos_color", {
		num=needNum,
		colorTip=colorTip,
		colorStr=colorStr,
		outlineColorStr=outlineColorStr,
		outlineSize=outlineSize,
		imgPath = params.res_mini,
		costNum = needCost
	})
	local widget = ccui.RichText:createWithContent(tipStr)
	widget:setPosition(self._txtUnlockTip:getPosition())
	self._txtUnlockTip:setVisible(false)
	self._txtUnlockTip:getParent():addChild(widget)

	self._count = math.ceil(#self._herosData / 6)

	if self._count == 0 then
		self._listView:setVisible(false)
		self._txtEmpty:setVisible(true)
	else
		self._listView:setTemplate(PopupTacticsUnclockCell)
		self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		self._listView:setCustomCallback(handler(self, self._onItemTouch))
		self._listView:resize(self._count)
		self._listView:setVisible(true)
		self._txtEmpty:setVisible(false)
	end
	self:_updateInfo()
end

function PopupTacticsUnclock:_onItemUpdate(item, index)
	local index = index * 6
	local dataList = {}
	local isAddedList = {}

	for i=1,6 do
		if self._herosData[index + i] then
			local heroData = self._herosData[index + i]
			dataList[i] = heroData
			isAddedList[i] = self._selectList[index+i] and true or false
		end
	end

	item:updateUI(dataList, isAddedList)
end

function PopupTacticsUnclock:_onItemSelected(item, index)

end

function PopupTacticsUnclock:getSelectedHeroNum()
	local num = table.nums(self._selectList)
	return num
end

function PopupTacticsUnclock:_onItemTouch(index, t, selected, item)
	if selected and self:getSelectedHeroNum()>=self._maxNum then
		G_Prompt:showTip(Lang.get("tactics_unlock_position_max_tip"))
		item:setSelectState(t, false)
		return
	end

	local trueIndex = index*6 + t
	local heroData = self._herosData[trueIndex]
	if selected then
		self._selectList[trueIndex] = heroData
	else
		self._selectList[trueIndex] = nil
	end
    item:setSelectState(t, selected)

	self:_updateInfo()
end

function PopupTacticsUnclock:_onButtonClose()
	self:close()
end

function PopupTacticsUnclock:_onButtonUnlock()
	local num = 0
	for k,v in pairs(self._selectList) do
		num = num+1
	end
	if num<self._maxNum then
		return
	end
	
	local UserCheck = require("app.utils.logic.UserCheck")
	local retValue, dlgFunc = UserCheck.enoughJade2(self._cost)
	if retValue == false then
		dlgFunc()
		return
	end

	if self._clickOk then
		self._clickOk(self._selectList)
	end
	self:close()
end

function PopupTacticsUnclock:_updateInfo()
	local curNum = self:getSelectedHeroNum()
	self._fileNodeDes1:updateUI(Lang.get("tactics_unlock_position_select_tip"), curNum, self._maxNum)
	if curNum<self._maxNum then
		self._fileNodeDes1:setValueColor(Colors.TacticsCommonColor)
		self._fileNodeDes1:setMaxColor(Colors.TacticsCommonColor)
		self._btnUnlock:setEnabled(false)
	else
		self._fileNodeDes1:setValueColor(Colors.BRIGHT_BG_GREEN)
		self._fileNodeDes1:setMaxColor(Colors.TacticsCommonColor)
		self._btnUnlock:setEnabled(true)
	end
end


return PopupTacticsUnclock
