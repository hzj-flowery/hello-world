

local PopupBase = require("app.ui.PopupBase")
local PopupCommentGuide = class("PopupCommentGuide", PopupBase)

function PopupCommentGuide:ctor(okCallBack,cancelCallBack)
    self._okCallBack = okCallBack
    self._cancelCallBack = cancelCallBack
	local resource = {
		file = Path.getCSB("PopupCommentGuide", "common"),
		binding = {
            _buttonCancel = {
                events = {{event = "touch", method = "_onClickBtnCancel"}}
            },
			_buttonOk = {
				events = {{event = "touch", method = "_onClickBtnOk"}}
			},
		},
	}
	PopupCommentGuide.super.ctor(self, resource)
end

-- Describle：
function PopupCommentGuide:onCreate()

    self._buttonCancel:setString(Lang.get("comment_guide_button_cancel"))
	self._buttonOk:setString(Lang.get("comment_guide_button_ok"))

end

-- Describle：
function PopupCommentGuide:onEnter()

end

-- Describle：
function PopupCommentGuide:onExit()

end


function PopupCommentGuide:_onClickBtnCancel()
    if self._cancelCallBack then
        self._cancelCallBack()
    end
	self:close()
end

function PopupCommentGuide:_onClickBtnOk()
	if self._okCallBack then
		self._okCallBack()
	end
	self:close()
end

return PopupCommentGuide