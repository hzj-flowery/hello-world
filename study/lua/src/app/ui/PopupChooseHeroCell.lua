--
-- 选择武将cell 通用界面

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseHeroCell = class("PopupChooseHeroCell", ListViewCellBase)

function PopupChooseHeroCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseHeroCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2 = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			}
		}
	}
	PopupChooseHeroCell.super.ctor(self, resource)
end

function PopupChooseHeroCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	for i = 1, 2 do
		local render = self["_textDes" .. i]:getVirtualRenderer()
		render:setLineHeight(24)
	end
end

function PopupChooseHeroCell:update(data1, data2)
	local function updateCell(index, data)
		if data then
			local TypeConvertHelper = require("app.utils.TypeConvertHelper")
			local type = TypeConvertHelper.TYPE_HERO
			local baseId = data:getBase_id()
			local limitLevel = data:getLimit_level()
			local limitRedLevel = data:getLimit_rtg()
			self["_item" .. index]:setVisible(true)
			self["_item" .. index]:updateUI(type, baseId)
			self["_item" .. index]:setTouchEnabled(true)
			local commonIcon = self["_item" .. index]:getCommonIcon()
			commonIcon:getIconTemplate():updateUI(baseId, nil, limitLevel, limitRedLevel)
			if data.topImagePath and data.topImagePath ~= "" then
				commonIcon:setTopImage(data.topImagePath)
			end

			local params = commonIcon:getItemParams()
			local rank = data:getRank_lv()
			local heroName = params.name
			if rank > 0 then
				if params.color == 7 and limitLevel == 0 and params.type ~= 1 then -- 金将
					heroName = heroName .. " " .. Lang.get("goldenhero_train_text") .. rank
				else
					heroName = heroName .. "+" .. rank
				end
			end
			if not data:isPureGoldHero() and params.color==7 then
				self["_item" .. index]:setName(heroName, params.icon_color, params)
			else
				self["_item" .. index]:setName(heroName, params.icon_color)
			end

			self["_textDes" .. index]:removeAllChildren()
			if data:isPureGoldHero() then
				data.richTextDesc = {}
				data.richTextDesc[1] = Lang.get("reborn_hero_list_rich_text3", {level = rank})
			end
			if data.richTextDesc then
				local height = self["_textDes" .. index]:getContentSize().height
				for i, desc in ipairs(data.richTextDesc) do
					local richWidget = ccui.RichText:create()
					richWidget:setRichTextWithJson(desc)
					richWidget:setAnchorPoint(cc.p(0, 1))
					richWidget:setPosition(cc.p(0, height - (i - 1) * 25))
					self["_textDes" .. index]:addChild(richWidget)
				end
				self["_textDes" .. index]:setString("")
			else
				self["_textDes" .. index]:setString(data.textDesc)
			end

			self["_buttonChoose" .. index]:setString(data.btnDesc)
			if data.btnIsHightLight == false then
				self["_buttonChoose" .. index]:switchToNormal()
			else
				self["_buttonChoose" .. index]:switchToHightLight()
			end

			self["_buttonChoose" .. index]:setEnabled(data.btnEnable)
			self["_buttonChoose" .. index]:showRedPoint(data.btnShowRP)
		else
			self["_item" .. index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PopupChooseHeroCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseHeroCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChooseHeroCell
