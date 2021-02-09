--通用奖励列表控件
--主要用于一行奖励的显示，支持可以滚动功能
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CommonListViewLineItem = class("CommonListViewLineItem")

local EXPORTED_METHODS = {
    "updateUI",
	"setMaxItemSize",
	"setListViewSize",
	"setItemsMargin",
    "setItemSpacing",
    "getListViewItem",
    "getItemContentSize",
	"alignCenter",
    "setIconMask",
    "setScrollDuration",
    "setMagneticType",
    "setGravity",
    "jumpToPercentHorizontal",
}

function CommonListViewLineItem:ctor()
	self._target = nil
	self._maxItemSize = 4
    self._itemSpacing = 0
    self._itemContentSize = {}
end

function CommonListViewLineItem:_init()
	self._listViewItem = ccui.Helper:seekNodeByName(self._target, "ListViewItem")
	self._listViewItem:setScrollBarEnabled(false)
end

function CommonListViewLineItem:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonListViewLineItem:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--超过该物品大小，则ListView可拖动
function CommonListViewLineItem:setMaxItemSize(itemSize)
	self._maxItemSize = itemSize
end

function CommonListViewLineItem:setListViewSize(width, height)
	width = width or 350
	height= height or 90
	self._listViewItem:setContentSize(width,height)
end

function CommonListViewLineItem:getListViewItem()
	return self._listViewItem
end

--奖励列表
function CommonListViewLineItem:updateUI(awardList, scale, adaptWithContainerSize,showTopImage, isDouble)
	scale = scale or 0.8
	self._listViewItem:removeAllChildren()

	--当奖励数量超过4个则可拖动
	self._listViewItem:setTouchEnabled(#awardList > self._maxItemSize)

	local totalW = 	self._listViewItem:getItemsMargin() * (#awardList -1)
	local totalH = 0

	for index, award in ipairs(awardList) do
		-- if award.type == TypeConvertHelper.TYPE_HEAD_FRAME then
		-- 	scale = 0.65
		-- end		
		local widget,uiNode = self:_createItemIcon(award, scale)

		if widget then
            local size = widget:getContentSize()
            self._itemContentSize = size
            widget:setContentSize(size.width + self._itemSpacing, size.height)
			self._listViewItem:pushBackCustomItem(widget)
			if showTopImage then
				self:_showHeroTopImage(uiNode)
			end
			totalW = totalW + size.width + self._itemSpacing
			totalH = totalH + size.height

			uiNode:showDoubleTips(isDouble)
		end
	end

	if adaptWithContainerSize then
		self._listViewItem:setInnerContainerSize(cc.size(totalW,totalH))
		self._listViewItem:setContentSize(cc.size(totalW,totalH))
	end

	--默认listViewItem点击可穿透
	self._listViewItem:setSwallowTouches(false)
end

--设置物品间隔
function CommonListViewLineItem:setItemsMargin(margin)
	self._listViewItem:setItemsMargin(margin)
end


function CommonListViewLineItem:_createItemIcon(award, scale)
	local UIHelper = require("yoka.utils.UIHelper")
	local widget,uiNode = UIHelper.createIconTemplate(award, scale)
	return widget,uiNode
end

function CommonListViewLineItem:setItemSpacing(space)
    self._itemSpacing = space or 0
end


function CommonListViewLineItem:alignCenter()
	self._listViewItem:setPosition(0,0)
	self._listViewItem:setAnchorPoint(cc.p(0.5, 0.5))
end

function CommonListViewLineItem:_showHeroTopImage(iconTemplate)
	local setTopImage = function(templateIcon,heroId)
		local UserDataHelper = require("app.utils.UserDataHelper")
		local res = UserDataHelper.getHeroTopImage(heroId)
		if res then
			templateIcon:showTopImage(true)
			templateIcon:setTopImage(res)
			return true
		end
		templateIcon:showTopImage(false)
		return false
	end
	local itemParams = iconTemplate:getItemParams()
   	if itemParams.type == TypeConvertHelper.TYPE_HERO  then
		setTopImage(iconTemplate,itemParams.value) 
	elseif itemParams.type == TypeConvertHelper.TYPE_FRAGMENT then
		if itemParams.cfg.comp_type == 1 then -- 武将合成类型
			setTopImage(iconTemplate,itemParams.cfg.comp_value)
		end
	end
end

function CommonListViewLineItem:setIconMask(mask)
	local children = self._listViewItem:getItems()
	for k,v in ipairs(children) do
		 v:getChildren()[1]:setIconMask(mask)
		 v:getChildren()[1]:setIconSelect(mask)
	end
end

function CommonListViewLineItem:setScrollDuration(time)
    -- body
    self._listViewItem:setScrollDuration(time)
end

function CommonListViewLineItem:setMagneticType(type)
    -- body
    self._listViewItem:setMagneticType(type)
end

function CommonListViewLineItem:setGravity(type)
    -- body
    self._listViewItem:setGravity(type)
end

function CommonListViewLineItem:jumpToPercentHorizontal(percent)
    -- body
    self._listViewItem:jumpToPercentHorizontal(percent)
end

function CommonListViewLineItem:getItemContentSize()
    -- body
    return self._itemContentSize
end



return CommonListViewLineItem
