--
-- Author: hedl
-- Date: 2017-03-06 18:02:15
-- Icon模板类，由该模板类，再构建Icon，绑定Component
-- IconBase的wapper模式

local UIHelper  = require("yoka.utils.UIHelper")
local CommonIconTemplate = class("CommonIconTemplate")

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local EXPORTED_METHODS = {
	"initUI",
	"unInitUI",
	"getIconTemplate",
	--下面是根据IconBase做接口绑定
	"isInit",
	"updateUI",
	"loadColorBg",
	"loadIcon",
	"appendUI",
	"setUniqueId",
	"setName",
	"showName",
	"setCount",
	"setIconMask",
	"setIconDark",
	"setIconSelect",
	"setTouchEnabled",
	"setSwallowTouchesEnabled",
	"setCallBack",
	"getItemParams",
	"getPanelSize",
	"getType",
	"showCount",
	"setIconVisible",
	"setTopImage",
	"showTopImage",
	"setImageTemplateVisible",
	"refreshToEmpty",
	"showLightEffect",
	"removeLightEffect",
    "showIconEffect",
    "setEquipBriefVisible",
    "updateEquipBriefBg",
	"updateEquipBriefIcon",
	"hideBg",
	"showDoubleTips",
	"setIconScale"
}

function CommonIconTemplate:ctor()
	self._iconTemplate = nil
	self._doubleTips = nil
end

function CommonIconTemplate:_init()
	self._imageTemplate = ccui.Helper:seekNodeByName(self._target, "ImageTemplate")
	self._imageTemplate:setVisible(false)

	self._doubleTips = ccui.Helper:seekNodeByName(self._target, "Image_doubleTips")
	if self._doubleTips then
		self._doubleTips:setVisible(false)
		self._doubleTips:setLocalZOrder(10)
	end
end

function CommonIconTemplate:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonIconTemplate:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

--返回Icon模板
function CommonIconTemplate:getIconTemplate()
	self:_checkInit()
	return self._iconTemplate
end

function CommonIconTemplate:unInitUI()
	if self._iconTemplate then
		self._iconTemplate:removeFromParent(true)
		self._iconTemplate = nil
	end

end

function CommonIconTemplate:isInit()
	return self._iconTemplate ~= nil
end

function CommonIconTemplate:initUI(iconType,iconValue,iconSize)
	self:setImageTemplateVisible(false)
	if self._iconTemplate == nil then
		self._iconTemplate = ComponentIconHelper.createIcon(iconType,iconValue,iconSize)
		self._target:addChild(self._iconTemplate)
	end
end

function CommonIconTemplate:showDoubleTips(flag)
	if self._doubleTips then
		self._doubleTips:setVisible(flag)
	end
end

function CommonIconTemplate:_checkInit()
	assert(self._iconTemplate,"self._iconTemplate must be inited")
end

function CommonIconTemplate:updateUI(value, size)
	self:_checkInit()
	self._iconTemplate:updateUI(value,size)
end


function CommonIconTemplate:loadColorBg(res)
	self:_checkInit()
	self._iconTemplate:loadColorBg(res)
end

function CommonIconTemplate:loadIcon(res)
	self:_checkInit()
	self._iconTemplate:loadIcon(res)
end


function CommonIconTemplate:appendUI(node)
	self:_checkInit()
	self._iconTemplate:appendUI(node)
end

function CommonIconTemplate:getType()
	self:_checkInit()
	return self._iconTemplate:getType()
end


function CommonIconTemplate:getItemParams()
	self:_checkInit()
	return self._iconTemplate:getItemParams()
end

--构建底部数字，右下角
function CommonIconTemplate:setCount(size)
	self:_checkInit()
	self._iconTemplate:setCount(size)
end

function CommonIconTemplate:setUniqueId(id)
	if self._iconTemplate:getItemParams() ~= nil then
		self._iconTemplate:getItemParams().uniqueId = id
	end
end

function CommonIconTemplate:showName(needShow,fixWidth)
	self:_checkInit()
	self._iconTemplate:showName(needShow,fixWidth)
end

function CommonIconTemplate:setName(nameStr)
	self:_checkInit()
	logWarn("CommonIconTemplate:setName   "..nameStr)
	self._iconTemplate:setName(nameStr)
end

function CommonIconTemplate:showCollect(needShow)
	self:_checkInit()
	self._iconTemplate:showCollect(needShow)
end

--设置Icon灰色蒙层
function CommonIconTemplate:setIconMask(needMask)
	self:_checkInit()
	self._iconTemplate:setIconMask(needMask)
end


--设置Icon灰色蒙层
function CommonIconTemplate:setIconDark(needDark)
	self:_checkInit()
	self._iconTemplate:setIconDark(needDark)
end

function CommonIconTemplate:setCallBack(callback)
	self:_checkInit()
	self._iconTemplate:setCallBack(callback)
end


function CommonIconTemplate:setTouchEnabled(enabled)
	self:_checkInit()
	self._iconTemplate:setTouchEnabled(enabled)
end

function CommonIconTemplate:setSwallowTouchesEnabled(enabled)
	self:_checkInit()
	self._iconTemplate:setSwallowTouchesEnabled(enabled)
end



function CommonIconTemplate:setIconSelect(enabled)
	self:_checkInit()
	self._iconTemplate:setIconSelect(enabled)
end

function CommonIconTemplate:showCount(needShow)
	if self._iconTemplate ~= nil then
		self._iconTemplate:showCount(needShow)
	end
end

function CommonIconTemplate:getPanelSize()
	if self._iconTemplate then
		return self._iconTemplate:getPanelSize()
	end
	return nil
end
function CommonIconTemplate:setIconVisible(visible)
	if self._iconTemplate ~= nil then
		self._iconTemplate:setIconVisible(visible)
	end
end

function CommonIconTemplate:setImageTemplateVisible(visible)
	if visible == nil then
		visible = false
	end
	self._imageTemplate:setVisible(visible)
end

function CommonIconTemplate:setTopImage(path)
	if self._iconTemplate.setTopImage then
		self._iconTemplate:setTopImage(path)
	end

end

function CommonIconTemplate:showTopImage(trueOrFalse)
	if self._iconTemplate.showTopImage then
		self._iconTemplate:showTopImage(trueOrFalse)
	end

end

function CommonIconTemplate:refreshToEmpty()
	self:setImageTemplateVisible(true)
	self._imageTemplate:setOpacity(25)
end


function CommonIconTemplate:showLightEffect(...)
	self._iconTemplate:showLightEffect(...)
end

function CommonIconTemplate:removeLightEffect()
	self._iconTemplate:removeLightEffect()
end


function CommonIconTemplate:showIconEffect(...)
	self._iconTemplate:showIconEffect(...)
end

function CommonIconTemplate:setEquipBriefVisible(...)
    self._iconTemplate:setEquipBriefVisible(...)
end

function CommonIconTemplate:updateEquipBriefBg(...)
    self._iconTemplate:updateEquipBriefBg(...)
end

function CommonIconTemplate:updateEquipBriefIcon(...)
    self._iconTemplate:updateEquipBriefIcon(...)
end

function CommonIconTemplate:hideBg()
	self._iconTemplate:hideBg()
end

function CommonIconTemplate:setIconScale(scale)
	self._iconTemplate:setScale(scale)
end

return CommonIconTemplate
