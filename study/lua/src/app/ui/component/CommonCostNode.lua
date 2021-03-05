--
-- Author: Liangxu
-- Date: 2017-05-12 13:40:36
-- 通用材料

local CommonCostNode = class("CommonCostNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local EXPORTED_METHODS = {
    "updateView",
    "isReachCondition",
	"getNeedCount",
	"getMyCount",
	"setCloseMode"
}

function CommonCostNode:ctor()
	self._target = nil
	self._fileNodeIcon = nil
	self._textName = nil
	self._nodeNumPos = nil
	self._addSprite = nil
	self._closeMode = nil --是否是横向排列的紧凑模式
end

function CommonCostNode:_init()
	self._fileNodeIcon = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeIcon, "CommonIconTemplate")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._nodeNumPos = ccui.Helper:seekNodeByName(self._target, "NodeNumPos")
end

function CommonCostNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonCostNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonCostNode:updateView(data, filterId)
	self._fileNodeIcon:initUI(data.type, data.value, data.size)
	self._fileNodeIcon:showCount(false)
	self._fileNodeIcon:setTouchEnabled(true)
	self._fileNodeIcon:setCallBack(handler(self, self._onClickIcon))

	local param = TypeConvertHelper.convert(data.type, data.value)
	self._textName:setString(param.name)
	self._textName:setColor(param.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._textName, param)

	self._myCount = UserDataHelper.getSameCardCount(data.type, data.value, filterId) --我拥有的同名卡数量
	dump(self._myCount)
	self._needCount = data.size --同名卡数量
	
	local color = self._myCount < self._needCount and Colors.colorToNumber(Colors.uiColors.RED) or Colors.colorToNumber(Colors.uiColors.GREEN)
	self._isReachCondition = self._myCount >= self._needCount
	self._fileNodeIcon:setIconMask(not self._isReachCondition)
	if not self._isReachCondition then
		if self._addSprite == nil then
			self._addSprite = cc.Sprite:create(Path.getUICommon("img_com_btn_add01"))
			self._fileNodeIcon:addChild(self._addSprite)
			local UIActionHelper = require("app.utils.UIActionHelper")
	   		UIActionHelper.playBlinkEffect(self._addSprite)
		end
	else
		if self._addSprite then
			self._addSprite:removeFromParent()
			self._addSprite = nil
		end
	end
	local content = Lang.get("treasure_refine_cost_count", {
		value1 = self._myCount,
		color = color,
		value2 = self._needCount,
	})
	local richText = ccui.RichText:createWithContent(content)
	if self._closeMode then
		richText:setAnchorPoint(cc.p(0.5, 1.0))
	else
		richText:setAnchorPoint(cc.p(0.0, 1.0))
	end
	self._nodeNumPos:removeAllChildren()
	self._nodeNumPos:addChild(richText)
end

--是否满足条件
function CommonCostNode:isReachCondition()
	return self._isReachCondition
end

function CommonCostNode:getNeedCount()
	return self._needCount
end

function CommonCostNode:getMyCount()
	return self._myCount
end

--设置紧密模式 适合横向排列
function CommonCostNode:setCloseMode()
	self._closeMode = true
	self._textName:setVisible(false)
	self._nodeNumPos:setPosition(cc.p(0, -40))
end

--宝物加入物品获取途径 by hedili
function CommonCostNode:_onClickIcon()
	local itemParam = self._fileNodeIcon:getItemParams()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new()
	PopupItemGuider:updateUI(itemParam.item_type, itemParam.cfg.id)
	PopupItemGuider:openWithAction()
end

return CommonCostNode