--弹出界面
--选择奖励弹窗
--有checkBox进行选择
local PopupSelectRewardTab = require("app.ui.PopupSelectRewardTab")
local PopupSelectRewardTabNum = class("PopupSelectRewardTabNum", PopupSelectRewardTab)


local Path = require("app.utils.Path")



function PopupSelectRewardTabNum:ctor( title, callback )
	--
	self._title = title or Lang.get("common_btn_help") 
	self._callback = callback

	self._commonNumSelect = nil

	self._totalNum = 1
	self._selectTabIndex = 1

	--control init
	self._btnOK = nil -- 

	self._listCell = nil
	self._listItem = nil --拥有物品

	PopupSelectRewardTabNum.super.ctor(self, title, callback)

end

function PopupSelectRewardTabNum:onInitCsb(resource)
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupSelectRewardTabNum", "common"),
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


function PopupSelectRewardTabNum:onCreate()
	PopupSelectRewardTabNum.super.onCreate(self)
	self._commonNumSelect:setCallBack(handler(self, self._onNumSelect))
	self._commonNumSelect:showButtonMax(false)
end

function PopupSelectRewardTabNum:setMaxLimit(max)
	self._commonNumSelect:setMaxLimit(max)
end
function PopupSelectRewardTabNum:_onNumSelect(totalNum)
	self._totalNum = totalNum
end

function PopupSelectRewardTabNum:hideNumSelect()
	self._commonNumSelect:setVisible(false)
end

function PopupSelectRewardTabNum:onEnter()
    
end

function PopupSelectRewardTabNum:onExit()
    
end

function PopupSelectRewardTabNum:onBtnOk()
	local isBreak
	if self._callback then
		local awards = self._itemList["key"..self._selectTabIndex]
		local awardItem = awards[self._boxIndex]
		--dump(awardItem)
		isBreak = self._callback(awardItem,self._boxIndex,self._totalNum)
	end
	if not isBreak then
		self:close()
	end
end


return PopupSelectRewardTabNum