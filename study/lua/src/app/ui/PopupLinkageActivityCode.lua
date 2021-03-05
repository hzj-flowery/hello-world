
-- Author: nieming
-- Date:2018-05-16 16:13:43
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupLinkageActivityCode = class("PopupLinkageActivityCode", PopupBase)


function PopupLinkageActivityCode:ctor(codeStr)

	--csb bind var name
	self._btnCopy = nil  --CommonButtonHighLight
	self._code = nil  --Text
	self._commonPop = nil  --CommonNormalSmallPop

	self._codeStr = codeStr
	local resource = {
		file = Path.getCSB("PopupLinkageActivityCode", "common"),
		binding = {
			_btnCopy = {
				events = {{event = "touch", method = "_onBtnCopy"}}
			},
		},
	}
	PopupLinkageActivityCode.super.ctor(self, resource)
end

-- Describle：
function PopupLinkageActivityCode:onCreate()
	self._commonPop:setTitle(Lang.get("linkage_activity_code_pop_title"))
	self._btnCopy:setString(Lang.get("linkage_activity_code_pop_btn_copy"))
	self._code:setString(self._codeStr)
end

-- Describle：
function PopupLinkageActivityCode:onEnter()

end

-- Describle：
function PopupLinkageActivityCode:onExit()

end
-- Describle：
function PopupLinkageActivityCode:_onBtnCopy()
	-- body
	G_NativeAgent:clipboard(self._codeStr)
	G_Prompt:showTip(Lang.get("linkage_activity_copy_tip"))
	self:close()
end

return PopupLinkageActivityCode
