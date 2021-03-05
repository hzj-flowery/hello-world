
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupHandBookCell = class("PopupHandBookCell", ListViewCellBase)

local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")

local LINE_ICON_HEIGHT = 138
local LINE_ICON_WIDTH = 920
local LINE_ICON_INTERVAL = 126
local LINE_ICON_NUM = 7
function PopupHandBookCell:ctor()
	self._target = nil
	self._buttonOK = nil   -- ok按钮
	self._nodePos = nil--控制位置的节点
	self._heroNode = nil--添加Item的节点
	self._panelCon = nil
	self._panelArray = nil  --Icon Array, 一行5个icon
	self._textHeroType = nil --英雄类型
	self._textHeroNum1 = nil --英雄数量1
	self._textHeroNum2 = nil --英雄数量2
	self._topImage = nil  	 --顶部图片
	local resource = {
		file = Path.getCSB("PopupHandBookCell", "common"),
	}
	PopupHandBookCell.super.ctor(self, resource)
	self._iconList = {}
end

function PopupHandBookCell:onCreate()

	local size = self._panelCon:getContentSize()
	self:setContentSize(size.width, size.height)

	--cc.bind(self._buttonOK, "CommonButtonSmallNormal")

	--self._buttonOK:addClickEventListenerEx(handler(self,self._onGoHandler), true, nil, 0)

end

--
function PopupHandBookCell:updateUI(color,heroIdArray,heroOwnerCount)

	--self._textTitleName:setString(cellValue.name)
	--self._textDesc:setString(cellValue.directions)
	if heroIdArray == nil then
		return
	end

	self._heroIdArray = heroIdArray
	

	self:_autoExtend(heroIdArray)
	self:_updateIconArray(heroIdArray)
	self:_updateHeroNum(color, heroOwnerCount)
	--self._iconTemplate:initUI(itemData.itemType, itemData.itemValue)
end

function PopupHandBookCell:_updateHeroNum(color,heroOwnerCount)
	local colorTitle = Lang.get("hero_color_title"..color)
	self:updateImageView("_topImage",{texture = Path.getUICommon("img_quality_title0".. color)})
	
	if heroOwnerCount.ownNum == heroOwnerCount.totalNum then
		self._textHeroNum1:setColor(Colors.uiColors.GREEN)
		self._textHeroNum2:setColor(Colors.uiColors.GREEN)
	else
		self._textHeroNum1:setColor(Colors.uiColors.RED)
		self._textHeroNum2:setColor(Colors.COLOR_TITLE_MAIN)
	end  

	self._textHeroNum1:setString(heroOwnerCount.ownNum)
	

	local num2Pos = self._textHeroNum1:getPositionX() + self._textHeroNum1:getContentSize().width

	self._textHeroNum2:setString("/"..heroOwnerCount.totalNum)
	self._textHeroNum2:setPositionX(num2Pos+2)
	self._textHeroType:setString(colorTitle)

	self._textHeroType:setColor(Colors.getColor(color))
	self._textHeroType:enableOutline(Colors.getColorOutline(color), 2)

end

--创建一行5个icon
function PopupHandBookCell:_createIconArray(node,heroIdArray)
	local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
	local totalNum = #heroIdArray
	local x , y = 0,0
	for i= 1, totalNum do
		local row = math.ceil(i / LINE_ICON_NUM)
		local column = i - (row-1) * LINE_ICON_NUM
		local icon = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_HERO)
		node:addChild(icon)
		icon:setName("hero"..i)
		icon:setPosition(LINE_ICON_INTERVAL*(column -1 ),(row -1) * -1 * LINE_ICON_HEIGHT )
		icon:setVisible(false)
		icon:setNameFontSize(22)
		table.insert(self._iconList, icon)


	end
end


function PopupHandBookCell:_updateIconArray(heroIdArray)
	for i, heroData in ipairs(heroIdArray) do
		local icon = self._iconList[i]
		if icon then
			icon:updateUI(heroData.cfg.id)
			icon:setVisible(true)
			icon:setTouchEnabled(true)
			icon:showName(true)
			if heroData.isHave == true then
				--icon:setIconDark(false)
				icon:setIconMask(false)
			else
				--icon:setIconDark(true)
				icon:setIconMask(true)
			end
			--icon:setIconDark(true)
		end
	end
end



--根据行数，自动扩展
function PopupHandBookCell:_autoExtend(heroIdArray)
	local lineCount = math.ceil(#heroIdArray / LINE_ICON_NUM)
	local rootContentSize = self._panelCon:getContentSize()
	local extendSize = (lineCount-1)*LINE_ICON_HEIGHT
	local rootContentHeight = extendSize + rootContentSize.height 
	self._panelCon:setContentSize(cc.size(rootContentSize.width, rootContentHeight))
	local size = self._panelCon:getContentSize()
	self:setContentSize(size.width, size.height)
	
	self._nodePos:setPositionY(extendSize)
	self:_createIconArray(self._heroNode,heroIdArray)

end

return PopupHandBookCell