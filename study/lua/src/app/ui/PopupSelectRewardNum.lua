--弹出界面
--选择奖励弹窗
--有checkBox进行选择
local PopupSelectReward = require("app.ui.PopupSelectReward")
local PopupSelectRewardNum = class("PopupSelectRewardNum", PopupSelectReward)


local Path = require("app.utils.Path")



function PopupSelectRewardNum:ctor( title, callback )
	--
	self._title = title or Lang.get("common_btn_help") 
	self._callback = callback

	self._commonNumSelect = nil
	self._totalNum = 1

	PopupSelectRewardNum.super.ctor(self,  title, callback)
end

function PopupSelectRewardNum:onInitCsb()
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupSelectRewardNum", "common"),
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


function PopupSelectRewardNum:onCreate()
	PopupSelectRewardNum.super.onCreate(self)
	self._commonNumSelect:setCallBack(handler(self, self._onNumSelect))
	self._commonNumSelect:showButtonMax(false)
end

function PopupSelectRewardNum:setMaxLimit(max)
	self._commonNumSelect:setMaxLimit(max)
end
function PopupSelectRewardNum:_onNumSelect(totalNum)
	self._totalNum = totalNum
end


function PopupSelectRewardNum:onEnter()
    
end

function PopupSelectRewardNum:onExit()
    
end

function PopupSelectRewardNum:onBtnOk()
	local isBreak
	if self._callback then
		local awardItem = self._itemList[self._boxIndex]
		
		isBreak = self._callback(awardItem,self._boxIndex,self._totalNum)
	end
	if not isBreak then
		self:close()
	end
end


return PopupSelectRewardNum