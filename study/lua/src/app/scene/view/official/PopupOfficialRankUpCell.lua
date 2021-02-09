
local ViewBase = require("app.ui.ViewBase")
local PopupOfficialRankUpCell = class("PopupOfficialRankUpCell", ViewBase)
local TextHelper = require("app.utils.TextHelper")

function PopupOfficialRankUpCell:ctor()
	local resource = {
		file = Path.getCSB("PopupOfficialRankUpCell", "official"),
	}
	PopupOfficialRankUpCell.super.ctor(self, resource)
end

function PopupOfficialRankUpCell:onCreate()

end


--
function PopupOfficialRankUpCell:updateUI(officialRank, isCurrent)
	self._officialRank = officialRank
	self._officialInfo = G_UserData:getBase():getOfficialInfo(officialRank)
	if isCurrent then
		--self:updateLabel("Text_title", { text = Lang.get("official_rank_title_cur")})
	else
		--self:updateLabel("Text_title", { text = Lang.get("official_rank_title_next")})
	end
	self:updateImageView("Image_title", {texture = Path.getTextHero(self._officialInfo.picture)})


	local valueList = {}
	local attrConfig = require("app.config.attribute")	
	valueList[1] = { name = Lang.get("official_all_all_combat") , value = self._officialInfo.all_combat}
	for i = 1,4,1 do
		local nameStr = attrConfig.get(self._officialInfo["attribute_type"..i]).cn_name 
		nameStr = Lang.get("official_all")..nameStr --TextHelper.expandTextByLen(nameStr,3)
		valueList[i+1] = { name = nameStr, value = self._officialInfo["attribute_value"..i]}
	end
	for index, value in ipairs(valueList) do
		self:_updateAttr(index, value.name, value.value, isCurrent )
	end
end

function PopupOfficialRankUpCell:_updateAttr(index, name, value, isCurrent)
	local panelAttr = self:getSubNodeByName("FileNode_attr"..index)
	if panelAttr == nil then
		return
	end
	local color = Colors.LIST_TEXT
	if isCurrent == false then
		color = Colors.BRIGHT_BG_GREEN
	end
	panelAttr:updateLabel("Text_name",   {text =  name..":"})
	panelAttr:updateLabel("Text_value",  {text =  "+"..value, color = color})
	panelAttr:updateImageView("Image_bg", {visible = (index % 2 ~= 0) })
	
	
end


return PopupOfficialRankUpCell