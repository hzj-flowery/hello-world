
-- Author: nieming
-- Date:2018-05-09 10:39:24
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CountryBossCityUnitNode = class("CountryBossCityUnitNode", ViewBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")
local ShaderHalper = require("app.utils.ShaderHelper")


function CountryBossCityUnitNode:ctor(cfg)

	--csb bind var name
	self._btnGo = nil  --Button
	self._imageName = nil  --ImageView
	self._infoText = nil  --Text

	self._cfg = cfg
	local resource = {
		file = Path.getCSB("CountryBossCityUnitNode", "countryboss"),
		binding = {
			_btnGo = {
				events = {{event = "touch", method = "_onBtnGo"}}
			},
		},
	}
	CountryBossCityUnitNode.super.ctor(self, resource)
end

-- Describle：
function CountryBossCityUnitNode:onCreate()
	self._imageName:loadTexture(Path.getCountryBossText(self._cfg.name_pic))
	self._imageName:ignoreContentAdaptWithSize(true)

	self._btnGo:ignoreContentAdaptWithSize(true)
	self._btnGo:loadTextures(Path.getCountryBossImage(self._cfg.city_pic), nil, nil, 0)

	-- if self._cfg.x < 0 then
		-- self._imageName:setPositionX(-1 * self._imageName:getPositionX())
		-- self._nodeFlag:setPositionX(-1 * self._nodeFlag:getPositionX())
	-- end
	CountryBossHelper.createSwordEft(self._nodeSword)
	CountryBossHelper.createFireEft(self._nodeFire)
	self:_createFlag()
	self:stopPlayFirstRankName()

	self:updateUI()

	if self._cfg.id == 5 or  self._cfg.id == 6 then
		self._nodeFire:setPositionX(-25)
	elseif self._cfg.id == 7 or  self._cfg.id == 8 then
		self._nodeFire:setPositionX(-25)
	end
end

function CountryBossCityUnitNode:updateUI()
	local data = G_UserData:getCountryBoss():getBossDataById(self._cfg.id)
	if not data then
		return
	end
	self._data = data

	if CountryBossHelper.getStage() == CountryBossConst.STAGE1 then
		self._nodeSword:setVisible(true)
	else
		self._nodeSword:setVisible(false)
	end
	self._nodeFlag:setVisible(false)
	self._infoBg:setVisible(true)
	self._infoText:setVisible(true)

	if data:isBossDie() then
		self._nodeFlag:setVisible(true)
		self._infoText:setString(Lang.get("country_boss_city_boss_die_label"))
		self._nodeSword:setVisible(false)
		self._nodeFire:setVisible(true)

		self._infoBg:setVisible(false)
		self._infoText:setVisible(false)

		self:stopPlayFirstRankName()
	else
		self._nodeFire:setVisible(false)
		self._infoText:setString(string.format("%s%%", math.floor(data:getNow_hp()*100/data:getMax_hp())))
	end

	if self._isPlayFirstRankName then
		local firstRank = data:getRankFirst()
		if firstRank then
			local rankStr = firstRank:getGuild_name()
			self:setRankTopNodeRichString(rankStr)
		end
	end

end

function CountryBossCityUnitNode:onEnter()

end
-- Describle：
function CountryBossCityUnitNode:onExit()

end
-- Describle：
function CountryBossCityUnitNode:_onBtnGo()
	-- body
	local curStage = CountryBossHelper.getStage()
	if curStage == CountryBossConst.NOTOPEN then
		G_Prompt:showTip(Lang.get("country_boss_open_tip"))
		return
	end

	if curStage ~= CountryBossConst.STAGE1 then
		local data = G_UserData:getCountryBoss():getBossDataById(self._cfg.id)
		if not data then
			return
		end
		if data:isBossDie() then
			G_Prompt:showTip(Lang.get("country_boss_not_stage1_tip1"))
		else
			G_Prompt:showTip(Lang.get("country_boss_not_stage1_tip2"))
		end
		return
	end

	G_SceneManager:showScene("countrybosssmallboss",self._cfg.id)
end


function CountryBossCityUnitNode:_createFlag()
	self._flagEffect = require("yoka.node.SpineNode").new(1)
	self._flagEffect:setAsset(Path.getEffectSpine("sanguozhanjiqizi"))
	-- self._flagEffect:setVisible(false)
	self._flagEffect:setAnimation("effect", true)
	self._nodeFlag:addChild(self._flagEffect)
	self._nodeFlag:setVisible(false)
end

function CountryBossCityUnitNode:playFirstRankName()

	local data = G_UserData:getCountryBoss():getBossDataById(self._cfg.id)
	if not data then
		return false
	end

	if data:isBossDie() then
		return false
	end

	local firstRank = data:getRankFirst()
	if not firstRank then
		return false
	end
	local rankStr = firstRank:getGuild_name()

	self:stopPlayFirstRankName()

	-- local rankStr = "三国战记天下哦"
	self:setRankTopNodeRichString(rankStr)
	self._isPlayFirstRankName = true
	self._rankTopNode:setOpacity(0)
	self._rankTopNode:setVisible(true)
	self._rankTopNode:setScale(0.1)

	local fadeIn = cc.FadeIn:create(0.2)
	local scaleToAction1 = cc.ScaleTo:create(0.2, 1.2)
	local appearAction = cc.Spawn:create(fadeIn, scaleToAction1)
	local scaleToAction2 = cc.ScaleTo:create(0.1, 1)

	local delay = cc.DelayTime:create(3)


	local fadeOut = cc.FadeOut:create(0.5)
	local scaleToAction3 = cc.ScaleTo:create(0.5, 1)
	local disappearAction = cc.Spawn:create(fadeOut, scaleToAction3)

	local callfuncAction = cc.CallFunc:create(function()
		self:stopPlayFirstRankName()
	end)
	local seq = cc.Sequence:create(appearAction,scaleToAction2, delay, disappearAction, callfuncAction)
	self._rankTopNode:runAction(seq)
	return true
end

function CountryBossCityUnitNode:stopPlayFirstRankName()
	if self._isPlayFirstRankName == true or self._isPlayFirstRankName == nil then
		self._isPlayFirstRankName = false
		self._rankTopNode:stopAllActions()
		self._rankTopNode:setVisible(false)
		self._rankTopNode:setOpacity(255)
		self._rankTopNode:setScale(1)
	end
end

function CountryBossCityUnitNode:setRankTopNodeRichString(name)
	self._rankTopNode:removeAllChildren()
	local richText = ccui.RichText:createRichTextByFormatString(
		Lang.get("country_boss_first_rank_rich", {name = name}),
		{defaultColor = Colors.DARK_BG_ONE, defaultSize = 20, other ={
			[2] = {outlineColor = Colors.DARK_BG_OUTLINE}
		}})

	self._rankTopNode:addChild(richText)
end


return CountryBossCityUnitNode
