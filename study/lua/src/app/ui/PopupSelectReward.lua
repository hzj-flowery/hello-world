--弹出界面
--选择奖励弹窗
--有checkBox进行选择
local PopupBase = require("app.ui.PopupBase")
local PopupSelectReward = class("PopupSelectReward", PopupBase)
local Path = require("app.utils.Path")
local CSHelper = require("yoka.utils.CSHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupSelectReward:ctor( title, callback )
	--
	self._title = title or Lang.get("common_btn_help") 
	self._callback = callback
	self._isShowCheck = true

	--control init
	self._btnOK = nil -- 
	self._btnCancel = nil
	self._labelTips = nil
	self._listCell = nil
	self._listItem = nil --拥有物品

	PopupSelectReward.super.ctor(self, nil, true)
end

function PopupSelectReward:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupSelectReward", "common"),
		binding = {
			_btnOK = {
				events = {{event = "touch", method = "onBtnOk"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			}
		}
	}
   if resource then
        CSHelper.createResourceNode(self, resource)
    end
end
--
function PopupSelectReward:onCreate()

	self._commonNodeBk:setTitle(self._title)
	self._btnOK:setString(Lang.get("common_btn_sure"))
	self._btnCancel:setString(Lang.get("common_btn_cancel"))

	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	
end

function PopupSelectReward:updateUI(awards)
	self._listItem:removeAllChildren()
	self._listCell = {}

	self._itemList = awards

	for index, award in ipairs(awards) do
		local iconCell = self:_createReward(index)
		iconCell:updateUI(award.type,award.value, award.size)
		table.insert(self._listCell, iconCell)
		self._listItem:pushBackCustomItem(iconCell)
	end

	if #awards > 3 then
		self._listItem:setTouchEnabled(true)
		--self._listItem:setContentSize(cc.size(540,320))
		self._listItem:doLayout()
	else
		self._listItem:adaptWithContainerSize()
		self._listItem:setTouchEnabled(false)
	end

end

function PopupSelectReward:_createReward(index)
	local iconTemplate = require("app.ui.PopupSelectRewardItemCell").new(index, handler(self, self._onClickCheckBox))
	iconTemplate:showCheck(self._isShowCheck)
	return iconTemplate
end

function PopupSelectReward:onlyShowOkButton()
	self._btnCancel:setVisible(false)
	self._btnOK:setPositionX(0)
end


function PopupSelectReward:showCheck(show)
	self._isShowCheck = show
	
	local items = self._listItem:getChildren()
	for k,v in ipairs(items) do
		v:showCheck(show)
	end

end


function PopupSelectReward:_onClickCheckBox(boxIndex)
	logWarn("check index is "..boxIndex)
	for i,cell in ipairs(self._listCell) do
		cell:setCheck(false)
		if i == boxIndex then
			cell:setCheck(true)
		end
	end

	self._boxIndex = boxIndex

end

function PopupSelectReward:onEnter()
    
end

function PopupSelectReward:onExit()
    
end

function PopupSelectReward:onBtnCancel()
	--if not isBreak then
		self:close()
	--end
end

function PopupSelectReward:onBtnOk()
	if not self._isShowCheck then
		self:close()
		return 
	end
	local isBreak
	if self._callback then
		local awardItem =self._itemList[self._boxIndex]
		isBreak = self._callback(awardItem,self._boxIndex)
	end
	if not isBreak then
		self:close()
	end
end

function PopupSelectReward:setTip(tip)
	self._labelTips:setString(tip)
end

return PopupSelectReward