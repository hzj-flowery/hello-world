--弹出界面
--历代名将装备武器确认框
local PopupBase = require("app.ui.PopupBase")
local PopupHistoryHeroUseWeapon = class("PopupItemUse", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")

PopupHistoryHeroUseWeapon.TYPE_NEED_WEAPON = 1		-- 需要确认武器 
PopupHistoryHeroUseWeapon.TYPE_NOT_NEED_WEAPON = 2	-- 不确认武器

function PopupHistoryHeroUseWeapon:ctor(callback)
	self._callback = callback
	self._weaponCount = 0
	self._usedHeroData = nil
	self._needWeaponType = PopupHistoryHeroUseWeapon.TYPE_NEED_WEAPON

	local resource = {
		file = Path.getCSB("PopupHistoryHeroUseWeapon", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			},
		}
	}
	PopupHistoryHeroUseWeapon.super.ctor(self, resource, true)
end

function PopupHistoryHeroUseWeapon:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
	self._commonNodeBk:setTitle(Lang.get("historyhero_use_weapon_title"))
	self._btnOk:setString(Lang.get("historyhero_use_weapon_add"))
	self._tip:setString(Lang.get("historyhero_use_weapon_tip"))
	self._tip:setVisible(false)
end

--type 1： 需要确认武器 2：不确认武器
--isFake 是否是假数据
function PopupHistoryHeroUseWeapon:updateUI(historyHeroList, type, isFake)
	local data = historyHeroList[1]
	self._usedHeroData = data
    local type = TypeConvertHelper.TYPE_HISTORY_HERO
    local baseId = data:getSystem_id()
    local param = TypeConvertHelper.convert(type, baseId, 1)

	self._heroIcon:updateUIWithUnitData(data, 1)
	self._heroIcon:setRoundType(false)
    self._heroName:setString(param.name)
	self._heroName:setColor(param.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._heroName, param)

	--名将数量
	local heroCount = isFake and 0 or #historyHeroList
	local heroLangKey = isFake and "historyhero_hero_count2" or "historyhero_hero_count"
	local richText = ccui.RichText:createRichTextByFormatString(
		Lang.get(heroLangKey, {num1 = heroCount, num2 = 1}),
		{defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 20, other ={
			[1] = {fontSize = 20}
		}})
	richText:setAnchorPoint(cc.p(0, 0.5))
	self._nodeHeroCount:addChild(richText)

	--武器
	local weaponId = data:getConfig().arm
	local weaponData = G_UserData:getHistoryHero():getHeroWeaponUnitData(weaponId)
	local weaponConfig = HistoryHeroDataHelper.getHistoryWeaponInfo(weaponId)
	if weaponData then
		self._weaponCount = weaponData:getNum()
	else
		self._weaponCount = 0
	end
	self._weaponIcon:updateUI(weaponId, 1) --不显示武器数量
	self._weaponName:setString(weaponConfig.name)
	self._weaponName:setColor(param.icon_color)-- 和名将一样的颜色

	--武器数量
	local langKey = self._weaponCount == 0 and "historyhero_hero_count2" or "historyhero_hero_count"
	local richText = ccui.RichText:createRichTextByFormatString(
		Lang.get(langKey, {num1 = self._weaponCount, num2 = 1}),
		{defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 20, other ={
			[1] = {fontSize = 20}
		}})
	richText:setAnchorPoint(cc.p(0, 0.5))
	self._nodeWeaponCount:addChild(richText)
	
	if self._needWeaponType == PopupHistoryHeroUseWeapon.TYPE_NEED_WEAPON and 
        self._weaponCount == 0 or heroCount == 0 then
		self._btnOk:setString(Lang.get("historyhero_use_weapon_ok"))
		self._tip:setVisible(true)
	end

	if isFake then
		self._heroIcon:setCallBack(handler(self, self._onBtnHistoryHeroIconNoHero))
	end
	if self._weaponCount == 0 then
		self._weaponIcon:setCallBack(handler(self, self._onBtnHistoryHeroWeaponIconNoHero))
	end
end

--type 1： 需要确认武器 2：不确认武器
function PopupHistoryHeroUseWeapon:setType(type)
	self._needWeaponType = type
	if type == PopupHistoryHeroUseWeapon.TYPE_NOT_NEED_WEAPON then
		self._nodeHero:setPositionX(158)
		self._nodeWeapon:setVisible(false)
		self._tip:setVisible(false)
	end
end

function PopupHistoryHeroUseWeapon:_onBtnOk()
	if self._needWeaponType == PopupHistoryHeroUseWeapon.TYPE_NEED_WEAPON and self._weaponCount > 0 then
        if self._callback then
            self._callback(self._usedHeroData)
            self:close()
        else
            self:close()
        end
	elseif self._needWeaponType == PopupHistoryHeroUseWeapon.TYPE_NOT_NEED_WEAPON then
		self._callback(self._usedHeroData)
		self:close()
	else
		self:close()
	end
end

function PopupHistoryHeroUseWeapon:_onBtnClose()
	self:close()
end

function PopupHistoryHeroUseWeapon:_onBtnHistoryHeroIconNoHero()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HISTORY_HERO, self._usedHeroData:getSystem_id())
	PopupItemGuider:openWithAction()
end

function PopupHistoryHeroUseWeapon:_onBtnHistoryHeroWeaponIconNoHero()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, self._usedHeroData:getConfig().arm)
	PopupItemGuider:openWithAction()
end



return PopupHistoryHeroUseWeapon
