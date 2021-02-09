--
-- Author: Liangxu
-- Date: 2018-3-9 14:15:11
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local SilkbagDetailCell = class("SilkbagDetailCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SilkbagConst = require("app.const.SilkbagConst")
local TextHelper = require("app.utils.TextHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")

function SilkbagDetailCell:ctor()
	local resource = {
		file = Path.getCSB("SilkbagDetailCell", "silkbag"),
		binding = {
			
		}
	}
	SilkbagDetailCell.super.ctor(self, resource)
end

function SilkbagDetailCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self:_initDesc()
end

function SilkbagDetailCell:_initDesc()
	local size = self._textDes:getContentSize()
	local sc = ccui.ScrollView:create()
	sc:setBounceEnabled(true)
	sc:setDirection(ccui.ScrollViewDir.vertical)
	sc:setTouchEnabled(true)
	sc:setSwallowTouches(true)
	sc:setScrollBarEnabled(false)
	sc:setContentSize(size)

	local label = cc.Label:createWithTTF("", Path.getCommonFont(), self._textDes:getFontSize())
	label:setColor(self._textDes:getColor())
	label:setMaxLineWidth(size.width)
	-- label:setAnchorPoint(self._textDes:getAnchorPoint())
	label:setAnchorPoint(cc.p(0, 1))
	self._textDesTrue = label

	self._textDes:getParent():addChild(sc)
	sc:setAnchorPoint(self._textDes:getAnchorPoint())
	sc:setPosition(cc.p(self._textDes:getPosition()))
	self._textDes:setVisible(false)
	sc:addChild(label)
	self._textDescSc = sc
end

function SilkbagDetailCell:_updateDesc(strDesc, color)
	self._textDesTrue:setString(strDesc)
	self._textDesTrue:setColor(color)
	
	local labelSize = self._textDesTrue:getContentSize()
	self._textDescSc:setInnerContainerSize(labelSize)
	local orgHeight = self._textDescSc:getContentSize().height
	local height = math.max(orgHeight, labelSize.height)
	self._textDesTrue:setPosition(cc.p(0, height))
	local enable = labelSize.height>orgHeight
	self._textDescSc:setTouchEnabled(enable)
	self._textDescSc:setSwallowTouches(enable)
end

function SilkbagDetailCell:update(data)
	local silkbagId = data.silkbagId
	local isEffective = data.isEffective
	local unitData = G_UserData:getSilkbag():getUnitDataWithId(silkbagId)
	local info = unitData:getConfig()

	local nameTemp = Lang.get("silkbag_name_title", {name = info.name})
	local nameStr = info.only == SilkbagConst.ONLY_TYPE_1 and Lang.get("silkbag_only_tip", {name = nameTemp}) or nameTemp
	local baseId = unitData:getBase_id()
	local params = self._fileNodeIcon:updateUI(baseId)
	self._textName:setString(nameStr)
	self._textName:setColor(params.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._textName, params)
	local markRes = isEffective and Path.getTextSignet("img_silkbag01") or Path.getTextSignet("img_silkbag02")
	self._imageMark:loadTexture(markRes)

	local desColor = isEffective and Colors.SYSTEM_TARGET or Colors.SYSTEM_TARGET_RED
	local description = info.description
	if info.type1 > 0 then --计算属性描述
		local tempLevel = tonumber(require("app.config.parameter").get(ParameterIDConst.SILKBAG_START_LV).content)
		description = ""
		local userLevel = G_UserData:getBase():getLevel()
		for i = 1, 2 do
			local attrId = info["type"..i]
			if attrId > 0 then
				local size = info["size"..i]
				local growth = info["growth"..i]
				local ratio = math.max(userLevel-tempLevel, 0)
				local attrValue = size + (growth * ratio)
				local name, value = TextHelper.getAttrBasicText(attrId, attrValue)
				description = description..name.."+"..value
			end
		end
	end
	
	self:_updateDesc(description, desColor)
end

function SilkbagDetailCell:update2(data)
	self._fileNodeIcon:updateUI(data.baseId)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, data.baseId)
	self._textName:setString(param.name)
	self._textName:setColor(param.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._textName, param)
	
	local markRes = data.isEffective and Path.getTextSignet("img_silkbag01") or Path.getTextSignet("img_silkbag02")
	local desColor = data.isEffective and Colors.SYSTEM_TARGET or Colors.SYSTEM_TARGET_RED
	self:_updateDesc(param.description, desColor)
	self._imageMark:setVisible(false)
end

return SilkbagDetailCell