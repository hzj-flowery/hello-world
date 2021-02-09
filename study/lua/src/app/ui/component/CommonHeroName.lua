--
-- Author: Liangxu
-- Date: 2017-03-09 17:16:01
-- 武将名字
local CommonHeroName = class("CommonHeroName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
	"setName",
	"disableOutline",
	"setFontSize",
	"setNameInUserDetail",
	"setConvertType",
	"setFontName"
}

function CommonHeroName:ctor()
	self._target = nil
	self._textName = nil
	self._convertType = TypeConvertHelper.TYPE_HERO
end

function CommonHeroName:setConvertType(type)
	-- body
	if type and type > 0 then
		self._convertType = type
	end
end

function CommonHeroName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
end

function CommonHeroName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHeroName:setName(baseId, rankLevel, limitLevel, outLine, limitRedLevel)
	if baseId == nil then
		self._target:setVisible(false)
		return
	end
	local heroParam = TypeConvertHelper.convert(self._convertType, baseId, nil, nil, limitLevel, limitRedLevel)

	local heroName = heroParam.name
	if rankLevel and rankLevel > 0 then 
		if heroParam.color == 7 and limitLevel == 0 and heroParam.type ~= 1 then  -- 金将
			heroName = heroName .. " " .. Lang.get("goldenhero_train_text") .. rankLevel
		else
			heroName = heroName .. "+" .. rankLevel
		end
	end

	self._textName:setString(heroName)
	self._textName:setColor(heroParam.icon_color)
	UIHelper.updateTextOutline(self._textName, heroParam)
	-- if outLine then
	-- 	self._textName:enableOutline(heroParam.icon_color_outline, 2)
	-- end
	self._target:setVisible(true)
end

function CommonHeroName:disableOutline()
	self._textName:disableEffect(cc.LabelEffect.OUTLINE)
end

function CommonHeroName:setFontSize(size)
	self._textName:setFontSize(size)
end

function CommonHeroName:setFontName(fontName)
	self._textName:setFontName(fontName)
end

--在查看其它玩家信息界面，设置名字，规则有所不同，另开一个接口
function CommonHeroName:setNameInUserDetail(name, officialLevel, rankLevel)
	local iconColor = Colors.getOfficialColor(officialLevel)
	if rankLevel and rankLevel > 0 then
		name = name .. "+" .. rankLevel
	end

	self._textName:setString(name)
	self._textName:setColor(iconColor)
	UIHelper.updateTextOfficialOutline(self._textName, officialLevel)
	self._target:setVisible(true)
end

return CommonHeroName
