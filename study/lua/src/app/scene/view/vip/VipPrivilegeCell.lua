--
-- Author: hedl
-- Date: 2017-5-2 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local VipPrivilegeCell = class("VipPrivilegeCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function VipPrivilegeCell:ctor()
	self._textDesc = nil
	self._textTitle = nil
	self._richNode = nil
	local resource = {
		file = Path.getCSB("VipPrivilegeCell", "vip"),
	}

	self._textDesc = nil 
	VipPrivilegeCell.super.ctor(self, resource)
end

function VipPrivilegeCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function VipPrivilegeCell:updateUI(textTitle, textDesc, isRed)
	self._textTitle:setString(Lang.get("lang_vip_privilege_title", {title= textTitle}))
	self._textDesc:setString(textDesc)

	self._textDesc:setPositionX(self._textTitle:getPositionX()+ self._textTitle:getContentSize().width)

	local descColor = nil
	if isRed and isRed == true then
		self._textTitle:setColor(Colors.NORMAL_BG_ONE)
		self._textDesc:setColor(Colors.NORMAL_BG_ONE)
		descColor = Colors.NORMAL_BG_ONE
	end

	self._richNode:setPositionX(self._textTitle:getPositionX()+ self._textTitle:getContentSize().width)
	self._richNode:removeAllChildren()
	
	local RichTextHelper = require("app.utils.RichTextHelper")
    local subTitles = RichTextHelper.parse2SubTitleExtend(textDesc,true)
    subTitles =  RichTextHelper.fillSubTitleUseColor(subTitles,
		{nil,descColor or Colors.BRIGHT_BG_GREEN,nil})
    
    local richElementList = RichTextHelper.convertSubTitleToRichMsgArr(colorParam or {
        textColor = descColor or  Colors.NORMAL_BG_ONE	,--跑马灯的默认字体颜色
        fontSize = 22,--跑马灯的默认字体大小
    },subTitles)
	local richStr = json.encode(richElementList)
	local labelText = ccui.RichText:createWithContent(richStr)
    labelText:setAnchorPoint(cc.p(0,0.5))
    labelText:setCascadeOpacityEnabled(true)
	self._richNode:addChild(labelText)

end



return VipPrivilegeCell