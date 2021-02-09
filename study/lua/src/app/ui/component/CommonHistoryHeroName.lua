-- Author: �û�����
-- Date:2018-11-23 17:11:36
-- Describle：

local CommonHistoryHeroName = class("CommonHistoryHeroName")

local EXPORTED_METHODS = {
	"setName",
	"setColor",
}

function CommonHistoryHeroName:ctor()
	self._target = nil
end

function CommonHistoryHeroName:_init()
	self._heroName = ccui.Helper:seekNodeByName(self._target, "Text_1")
end

function CommonHistoryHeroName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryHeroName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHistoryHeroName:setName(heroName)
	self._heroName:setString(heroName)
end

function CommonHistoryHeroName:setColor(color)
	self._heroName:setColor(color)
end


return CommonHistoryHeroName