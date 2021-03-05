

local ListViewCellBase = require("app.ui.ListViewCellBase")
local ChapterCityDropHeroCell = class("ChapterCityDropHeroCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function ChapterCityDropHeroCell:ctor()
    self._iconTemplate = nil
    self._iconTopImage = nil
    local resource = {
        file = Path.getCSB("ChapterCityDropHeroCell", "chapter"),
        binding = {
		}
    }
    ChapterCityDropHeroCell.super.ctor(self, resource)
end

function ChapterCityDropHeroCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function ChapterCityDropHeroCell:onEnter()
end

function ChapterCityDropHeroCell:onExit()
end

function ChapterCityDropHeroCell:updateUI(type,value,size)
   	self._iconTemplate:unInitUI()
	self._iconTemplate:initUI(type,value,size)
	self._iconTemplate:setTouchEnabled(false)
	self._iconTopImage:setVisible(false)
	local itemParams = self._iconTemplate:getItemParams()
   	if type == TypeConvertHelper.TYPE_HERO  then
		self:_showHeroTopImage(value) 
	elseif type == TypeConvertHelper.TYPE_FRAGMENT then
		if itemParams.cfg.comp_type == 1 then -- 武将合成类型
			self:_showHeroTopImage(itemParams.cfg.comp_value)
		end
	end
end


function ChapterCityDropHeroCell:_showHeroTopImage(heroId)
    local UserDataHelper = require("app.utils.UserDataHelper")
	local res = UserDataHelper.getHeroTopImage(heroId)
	if res then
		self._iconTopImage:loadTexture(res)
		self._iconTopImage:setVisible(true)
		return true
	end
	return false
end

return ChapterCityDropHeroCell
