
-- Author: nieming
-- Date:2018-05-09 10:39:32
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CountryBossInterceptCell = class("CountryBossInterceptCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")

function CountryBossInterceptCell:ctor()

	--csb bind var name
	self._commonButton = nil  --CommonButtonHighLight
	self._playerName = nil  --CommonPlayerName
	self._scrollView = nil  --ScrollView
	self._textCondition = nil  --Text
	self._textGuildName = nil  --Text
	self._textPoint = nil  --Text

	local resource = {
		file = Path.getCSB("CountryBossInterceptCell", "countryboss"),
		binding = {
			_commonButton = {
				events = {{event = "touch", method = "_onCommonButton"}}
			},
		},
	}
	CountryBossInterceptCell.super.ctor(self, resource)
end

function CountryBossInterceptCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)


	self._commonButton:setString(Lang.get("country_boss_intercept_pop_btn_name"))
end

function CountryBossInterceptCell:updateUI(data, index)
	-- body
	if not data then
		return
	end
	self._data = data
	self._rank:setString(index)
	self._playerName:updateUI(data:getName(), data:getOffice_level())
	self._textGuildName:setString(data:getGuild_name())
	self._textPoint:setString(TextHelper.getAmountText(data:getPower()))

	local scrollView = self._scrollView
	local commonHeroArr = scrollView:getChildren()

	local heroList = data:getHero_base_id()
	for index, commHero in ipairs(commonHeroArr) do
		local baseId = heroList[index]
		cc.bind(commHero,"CommonHeroIcon")
		commHero:setVisible(true)
		if baseId then
			local limitLevel = 0
			if index == 1 then --主角
				local covertId, param = require("app.utils.UserDataHelper").convertAvatarId(data)
				baseId = covertId
				limitLevel = param.limitLevel
			end
			commHero:updateUI(baseId, nil, limitLevel)
		else
			commHero:refreshToEmpty()
		end
	end

end
-- Describle：
function CountryBossInterceptCell:_onCommonButton()
	-- body
	if self._data then
		self:dispatchCustomCallback(self._data:getUser_id())
	end
end

return CountryBossInterceptCell
