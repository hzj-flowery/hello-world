-- Author: ÓÃ»§Ãû³Æ
-- Date:2018-11-23 17:11:47
-- Describleï¼š

local CommonHistoryAvatarNode = class("CommonHistoryAvatarNode")

local EXPORTED_METHODS = {

}

function CommonHistoryAvatarNode:ctor()
	self._target = nil
end

function CommonHistoryAvatarNode:_init()
	-- self._xxxxx = ccui.Helper:seekNodeByName(self._target, "xxxx")
end

function CommonHistoryAvatarNode:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryAvatarNode:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

return CommonHistoryAvatarNode