
-- Author: nieming
-- Date:2017-12-28 17:18:59
-- Describle：

local TeamSuggestPageViewItem = class("TeamSuggestPageViewItem", ccui.Widget)
local CSHelper = require("yoka.utils.CSHelper")
local Hero = require("app.config.hero")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function TeamSuggestPageViewItem:ctor()

	--csb bind var name
	self._heroAvater1 = nil  --CommonHeroAvatar
	self._heroAvater2 = nil  --CommonHeroAvatar
	self._heroAvater3 = nil  --CommonHeroAvatar
	self._heroAvater4 = nil  --CommonHeroAvatar
	self._heroAvater5 = nil  --CommonHeroAvatar
	self._heroAvater6 = nil  --CommonHeroAvatar
	self._heroName1 = nil  --Text
	self._heroName2 = nil  --Text
	self._heroName3 = nil  --Text
	self._heroName4 = nil  --Text
	self._heroName5 = nil  --Text
	self._heroName6 = nil  --Text
	self._heroPedespal1 = nil
	self._heroPedespal2 = nil
	self._heroPedespal3 = nil
	self._heroPedespal4 = nil
	self._heroPedespal5 = nil
	self._heroPedespal6 = nil
	local resource = {
		file = Path.getCSB("TeamSuggestPageViewItem", "teamSuggest"),

	}
	CSHelper.createResourceNode(self, resource)
end


function TeamSuggestPageViewItem:updateUI(data)
	if not data then
		return
	end
	for i=1, 6 do
		local heroID = data["hero"..i]
		if 1 == heroID then
			heroID = G_UserData:getHero():getRoleBaseId()
		end
		local heroConfig = Hero.get(heroID)
		assert(heroConfig ~= nil, string.format("can not get hero info id = %s", heroID or "nil"))
		self["_heroAvater"..i]:updateUI(heroID)
		self["_heroAvater"..i]:setTouchEnabled(true)

		if G_UserData:getHero():isInListWithBaseId(heroID) then
			self["_heroPedespal"..i]:loadTexture(Path.getEmbattle("img_embattleherbg_over"))
			self["_heroAvater"..i]:setColor(cc.c3b(255, 255, 255))
			-- self["_heroAvater"..i]:setOpacity(255)

		else
			self["_heroPedespal"..i]:loadTexture(Path.getEmbattle("img_embattleherbg_nml"))
			-- self["_heroAvater"..i]:setOpacity(170)
			self["_heroAvater"..i]:setColor(cc.c3b(150, 150, 150))

		end

		self["_heroAvater"..i]:setCallBack(function()
			local PopupHeroDetail = require("app.scene.view.heroDetail.PopupHeroDetail").new(TypeConvertHelper.TYPE_HERO ,heroID)
			PopupHeroDetail:openWithAction()
		end)
		self["_heroName"..i]:setString(heroConfig.name)
	end
end

return TeamSuggestPageViewItem
