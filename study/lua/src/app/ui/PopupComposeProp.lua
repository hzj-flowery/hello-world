
-- Author: liangxu
-- Date:2017-10-19 13:39:44
-- Describle：合成道具弹框

local PopupBase = require("app.ui.PopupBase")
local PopupComposeProp = class("PopupComposeProp", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

function PopupComposeProp:ctor(parentView, callback)
	self._textOwnCount = nil  --Text
	self._itemIconTarget = nil  --CommonIconTemplate
	self._commonNodeBk = nil  --CommonNormalSmallPop
	self._textName = nil  --Text
	self._itemIconSrc = nil  --CommonIconTemplate
	self._textTotalCount = nil  --Text
	self._btnOk = nil  --CommonButtonHighLight
	self._selectNumNode = nil  --CommonSelectNumNode

	self._parentView = parentView
	self._callback = callback
	self._useNum = 1

	local resource = {
		file = Path.getCSB("PopupComposeProp", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			},
		},
	}
	PopupComposeProp.super.ctor(self, resource)
end

-- Describle：
function PopupComposeProp:onCreate()
	self._commonNodeBk:setTitle(Lang.get("common_compose_prop_title"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onClickClose))
	self._btnOk:setString(Lang.get("common_compose_prop_btn"))
	self._selectNumNode:setCallBack(handler(self, self._onNumSelect))
end

-- Describle：
function PopupComposeProp:onEnter()

end

-- Describle：
function PopupComposeProp:onExit()

end

function PopupComposeProp:_onNumSelect(num)
	self._useNum = num
end

function PopupComposeProp:_onClickClose()
	self:close()
end

function PopupComposeProp:updateUI(fragmentId)
	self._fragmentId = fragmentId
	local ownCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local config = require("app.config.fragment").get(fragmentId)
	assert(config, string.format("fragment config can not find id = %d", fragmentId))
	local totalCount = config.fragment_num


	self._itemIconSrc:unInitUI()
	self._itemIconSrc:initUI(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	self._itemIconSrc:setImageTemplateVisible(true)
	self._textOwnCount:setString(ownCount)
	self._textTotalCount:setString("/"..totalCount)

	self._itemIconTarget:unInitUI()
	self._itemIconTarget:initUI(config.comp_type, config.comp_value)
	self._itemIconTarget:setImageTemplateVisible(true)
	local itemParams = self._itemIconTarget:getItemParams()
	self._textName:setString(itemParams.name)
	self._textName:setColor(itemParams.icon_color)
	self._textName:enableOutline(itemParams.icon_color_outline, 2)
	
	local maxLimit = math.floor(ownCount / totalCount)
	self._selectNumNode:setMaxLimit(maxLimit)
end

function PopupComposeProp:_onBtnOk()
	if self._callback then
		self._callback(self._fragmentId, self._useNum)
	end
	self:close()
end

return PopupComposeProp