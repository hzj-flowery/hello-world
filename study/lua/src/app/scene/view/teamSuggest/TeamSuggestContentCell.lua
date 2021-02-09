
-- Author: nieming
-- Date:2017-12-28 19:56:47
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local TeamSuggestContentCell = class("TeamSuggestContentCell", ListViewCellBase)
local UIHelper = require("yoka.utils.UIHelper")

function TeamSuggestContentCell:ctor()

	--csb bind var name
	self._content = nil  --SingleNode
	self._nodeTitle = nil  --CommonDetailTitle
	self._panelBg = nil  --Panel

	local resource = {
		file = Path.getCSB("TeamSuggestContentCell", "teamSuggest"),

	}
	TeamSuggestContentCell.super.ctor(self, resource)
end

function TeamSuggestContentCell:onCreate()
	-- body
	self._startSize = self._panelBg:getContentSize()
	self._startContentPosY = self._content:getPositionY()
	self._startTitlePosY = self._nodeTitle:getPositionY()
end

function TeamSuggestContentCell:updateUI(title, content)
	-- body
	self._content:removeAllChildren()
    -- self._nodeTitle:setTitleAndAdjustBgSize(title)
    self._nodeTitle:setTitle(title)
	local lines = string.split(content, "|")
	local height = 0
	for k, line in ipairs(lines) do
		local richtext = ccui.RichText:createRichTextByFormatString2(line, Colors.BRIGHT_BG_TWO, 18)
		richtext:setVerticalSpace(4)
		richtext:ignoreContentAdaptWithSize(false)
		richtext:setContentSize(cc.size(340,0))--高度0则高度自适应
		richtext:formatText()
		local virtualContentSize = richtext:getVirtualRendererSize()
	    local richTextWidth = virtualContentSize.width
	    local richtextHeight = virtualContentSize.height
		-- richtext:setContentSize(cc.size(richTextWidth, richtextHeight))
		richtext:setAnchorPoint(cc.p(0, 1))
		self._content:addChild(richtext)
		richtext:setPosition(35, -1 *height)
		local signImage = UIHelper.createImage({texture = Path.getUICommon("img_sign02") })
		signImage:setAnchorPoint(cc.p(0, 1))
		signImage:setPosition(15, -1 *height - 3)
		self._content:addChild(signImage)

		if k == #lines then
			height = height + richtextHeight
		else
			height = height + richtextHeight + 10
		end
	end
	self._content:setPositionY(self._startContentPosY + height)
	self._nodeTitle:setPositionY(self._startTitlePosY + height)
	self._panelBg:setContentSize(cc.size(self._startSize.width, self._startSize.height + height))
	self:setContentSize(cc.size(self._startSize.width, self._startSize.height + height))
end

return TeamSuggestContentCell
