--弹出界面
--选择奖励弹窗
--有checkBox进行选择
local PopupSelectReward = require("app.ui.PopupSelectReward")
local PopupSelectRewardTab = class("PopupSelectRewardTab", PopupSelectReward)
local Path = require("app.utils.Path")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupSelectRewardTab:ctor( title, callback )
	--
	self._title = title or Lang.get("common_btn_help") 
	self._callback = callback

	self._selectTabIndex = 1
	self._boxIndex = 0
	--control init
	self._btnOK = nil -- 

	self._listCell = nil
	self._listItem = nil --拥有物品

	PopupSelectRewardTab.super.ctor(self,  title, callback)

end


function PopupSelectRewardTab:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupSelectRewardTab", "common"),
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
function PopupSelectRewardTab:onCreate()
	PopupSelectRewardTab.super.onCreate(self)

	local param = {
		rootNode = self._nodeTabRoot,
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = 4,
		textList = {Lang.get("popup_select_tab1"),Lang.get("popup_select_tab2"), Lang.get("popup_select_tab3"),Lang.get("popup_select_tab4") }
	}
	
	self._tabGroup:recreateTabs(param)

end

function PopupSelectRewardTab:updateUI(itemList)

	self._itemList = itemList
	self._tabGroup:setTabIndex(1)
end


function PopupSelectRewardTab:_onTabSelect(index, sender)
	self._selectTabIndex = index

	self._listItem:removeAllChildren()

	self._listCell = {}

	local awards = self._itemList["key"..index]

	for index, award in ipairs(awards) do
		local iconCell = self:_createReward(index)
		iconCell:updateUI(award.type,award.value, award.size)
		table.insert(self._listCell, iconCell)
		self._listItem:pushBackCustomItem(iconCell)
	end
end



function PopupSelectRewardTab:onEnter()
    
end

function PopupSelectRewardTab:onExit()
    
end

function PopupSelectRewardTab:onBtnOk()
	if not self._isShowCheck then
	self:close()
		return 
	end
	if self._boxIndex == 0 then
		G_Prompt:showTip(Lang.get("recruit_choose_first"))
		return 
	end

	local isBreak
	if self._callback then
		local awards = self._itemList["key"..self._selectTabIndex]
		local awardItem = awards[self._boxIndex]
		
		isBreak = self._callback(awardItem)
	end
	if not isBreak then
		self:close()
	end
end

function PopupSelectRewardTab:setBtnEnabled(enable)
	self._btnOK:setEnabled(enable)
end

return PopupSelectRewardTab