-- 阵容武将ICON
-- Author: Liangxu
-- Date: 2017-02-16 10:35:19
--
local ViewBase = require("app.ui.ViewBase")
local TeamHeroIcon = class("TeamHeroIcon", ViewBase)
local TeamConst = require("app.const.TeamConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function TeamHeroIcon:ctor(pos, onClick, isPet)
	self._pos = pos
	self._onClick = onClick
	self._isPet = isPet or false --是否神兽

	local resource = {
		file = Path.getCSB("TeamKnightIcon", "team"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelTouch"}}
			},
		}
	}

	TeamHeroIcon.super.ctor(self, resource)
end

function TeamHeroIcon:onCreate()
	self:_initData()
	self:_initView()
	self:_hideAllWidget()
end

function TeamHeroIcon:onEnter()

end

function TeamHeroIcon:onExit()
	
end

function TeamHeroIcon:_initData()
	self._type = 0
	self._value = 0
	self._isOpen = false
end

function TeamHeroIcon:_initView()
	self._panelTouch:setSwallowTouches(false)
end

function TeamHeroIcon:_hideAllWidget()
	self._imageLock:setVisible(false)
	self._spriteAdd:setVisible(false)
	self._nodeCommon:removeAllChildren()
	self._imageSelected:setVisible(false)
	self._redPoint:setVisible(false)
	self._imageArrow:setVisible(false)
	self._imagePetBg:setVisible(self._isPet) --神兽底框
	self._imagePetCover:setVisible(self._isPet) --神兽前框
end

function TeamHeroIcon:updateIcon(type, value, funcId, limitLevel, limitRedLevel)
	self:_hideAllWidget()
	local isOpen, comment, info = LogicCheckHelper.funcIsOpened(funcId)

	self._type = type
	self._value = value
	self._isOpen = isOpen

	if not isOpen then
		self._imageLock:setVisible(true)
		local level = Lang.get("team_txt_unlock_position", {level = info.level})
		self._textOpenLevel:setString(level)
		return
	end

	if type > 0 and value > 0 then
		self:_createCommonIcon(type, value, limitLevel, limitRedLevel)
	else
		self._spriteAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect(self._spriteAdd)
	end
end

function TeamHeroIcon:_createCommonIcon(type, value, limitLevel, limitRedLevel)
	local icon = nil
	if type == TypeConvertHelper.TYPE_HERO then
		icon = CSHelper.loadResourceNode(Path.getCSB("CommonHeroIcon", "common"))
		icon:updateUI(value, nil, limitLevel, limitRedLevel)
	elseif type == TypeConvertHelper.TYPE_PET then
		icon = CSHelper.loadResourceNode(Path.getCSB("CommonPetIcon", "common"))
		icon:updateUI(value)
	end
	
	if icon then
		self._nodeCommon:addChild(icon)
	end
end

function TeamHeroIcon:_onPanelTouch(sender, state)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		if self._onClick then
			self._onClick(self._pos)
		end
	end
end

function TeamHeroIcon:setSelected(selected)
	self._imageSelected:setVisible(selected)
end

function TeamHeroIcon:showRedPoint(visible)
	self._redPoint:setVisible(visible)
end

function TeamHeroIcon:showImageArrow(visible)
	local UIActionHelper = require("app.utils.UIActionHelper")
	self._imageArrow:setVisible(visible)
	if visible then
		UIActionHelper.playFloatEffect(self._imageArrow)
	end
end

function TeamHeroIcon:onlyShow(type, value, limitLevel, limitRedLevel)
	self:_hideAllWidget()
	if type > 0 and value > 0 then
		self._isOpen = true
		self:_createCommonIcon(type, value, limitLevel, limitRedLevel)
	else
		self._isOpen = false
		self._imageLock:setVisible(true)
		self._panelTouch:setEnabled(false)
		self._textOpenLevel:setVisible(false)
	end
end

return TeamHeroIcon