--
-- Author: Liangxu
-- Date: 2017-03-29 17:07:16
-- 武将羁绊Avatar
local TeamYokeAvatarNode = class("TeamYokeAvatarNode")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function TeamYokeAvatarNode:ctor(target)
	self._target = target
	self:_init()
end

function TeamYokeAvatarNode:_init()
	self._fileNodeHero = ccui.Helper:seekNodeByName(self._target, "FileNodeHero")
	cc.bind(self._fileNodeHero, "CommonHeroAvatar")
	self._nodeNamePos = ccui.Helper:seekNodeByName(self._target, "NodeNamePos")
end

function TeamYokeAvatarNode:updateView(baseId, activatedCount, totalCount, limitLevel, limitRedLevel)
	self._fileNodeHero:updateUI(baseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId)
	local name = heroParam.name
	local desContent = Lang.get("hero_yoke_total_count_des", {
		name = name,
		count1 = activatedCount,
		count2 = totalCount,
	})
	local richText = ccui.RichText:createWithContent(desContent)
	richText:setAnchorPoint(cc.p(0.5, 0.5))
	self._nodeNamePos:removeAllChildren()
	self._nodeNamePos:addChild(richText)
end

function TeamYokeAvatarNode:setVisible(visible)
	self._target:setVisible(visible)
end

return TeamYokeAvatarNode