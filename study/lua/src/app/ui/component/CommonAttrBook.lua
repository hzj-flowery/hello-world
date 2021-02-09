-- Author: Panhoa
-- Date:2018-12-14
-- Describle：

local CommonAttrBook = class("CommonAttrBook")

local EXPORTED_METHODS = {
	"setAttrName",
    "setAttrColor",
    "setValue",
    "setValueColor",
}

function CommonAttrBook:ctor()
	self._target = nil
end

function CommonAttrBook:_init()
    self._attrName = ccui.Helper:seekNodeByName(self._target, "TextName")
    self._attrValue = ccui.Helper:seekNodeByName(self._target, "TextValue")
end

function CommonAttrBook:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonAttrBook:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

-- @Export      设置节点名
-- @Param       heroName
function CommonAttrBook:setAttrName(heroName)
	self._attrName:setString(heroName)
end

-- @Export      设置节点颜色
-- @Param       color
function CommonAttrBook:setAttrColor(color)
	self._attrName:setColor(color)
end

-- @Export      设置属性值
-- @Param       value
function CommonAttrBook:setValue(value)
	self._attrValue:setString(value)
end

-- @Export      设置属性颜色
-- @Param       color
function CommonAttrBook:setValueColor(color)
	self._attrValue:setColor(color)
end


return CommonAttrBook