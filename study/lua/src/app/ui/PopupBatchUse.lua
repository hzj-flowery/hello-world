--弹出界面
--物品使用弹框，可以批量使用
--可以更新ICON，以及消耗的物品
local PopupItemUse = require("app.ui.PopupItemUse")
local PopupBatchUse = class("PopupBatchUse", PopupItemUse)
local Path = require("app.utils.Path")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupBatchUse:ctor(title, callback )
	--
	self._title = title or Lang.get("common_title_fragment_merage") 
	self._callback = callback


	PopupBatchUse.super.ctor(self, self._title, self._callback)
end


function PopupBatchUse:onInitCsb()
	local resource = {
		file = Path.getCSB("PopupBatchUse", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			},
		}
	}
   if resource then
        CSHelper.createResourceNode(self, resource)
    end
end

--
function PopupBatchUse:onCreate()
	-- button
	PopupBatchUse.super.onCreate(self)
	self._btnOk:setString(Lang.get("common_btn_merage"))
end



function PopupBatchUse:updateUI( itemId )
	local itemType = TypeConvertHelper.TYPE_FRAGMENT
	PopupBatchUse.super.updateUI(self,itemType,itemId)
end


function PopupBatchUse:_onInit()
end


function PopupBatchUse:onEnter()
    
end

function PopupBatchUse:onExit()
    
end

return PopupBatchUse