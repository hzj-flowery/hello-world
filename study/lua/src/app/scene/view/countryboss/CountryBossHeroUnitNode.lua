
-- Author: nieming
-- Date:2018-05-09 10:39:24
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CountryBossHeroUnitNode = class("CountryBossHeroUnitNode", ViewBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")

function CountryBossHeroUnitNode:ctor(cfg)
	--csb bind var name
	self._heroAvatar = nil
	self._infoText = nil  --Text
	self._cfg = cfg
	self._isUnLock = nil
	self._isPlaying =false
	local resource = {
		file = Path.getCSB("CountryBossHeroUnitNode", "countryboss"),

	}
	CountryBossHeroUnitNode.super.ctor(self, resource)
end

-- Describle：
function CountryBossHeroUnitNode:onCreate()
	-- self._imageName:ignoreContentAdaptWithSize(true)
	self._heroAvatar:updateUI(self._cfg.hero_id)
	self._heroAvatar:setTouchEnabled(true)
	self._heroAvatar:setCallBack(handler(self, self._onBtnGo))
	--
	CountryBossHelper.createSwordEft(self._nodeSword)
	self:stopPlayFirstRankName()
	self._nameBg:setVisible(false)
	if self._cfg.x > 0 then
		self._heroAvatar:setScaleX(-1 * self._heroAvatar:getScaleX())
	end
	self:updateUI()
end


function CountryBossHeroUnitNode:updateUI()
	local data = G_UserData:getCountryBoss():getBossDataById(self._cfg.id)
	if not data then
		return
	end

	self._isUnLock = CountryBossHelper.getLockString(self._cfg)
	local isBossDie = data:isBossDie()
	local curStage = CountryBossHelper.getStage()

	if self._isUnLock and curStage ~= CountryBossConst.NOTOPEN and not isBossDie then
		self._heroAvatar:cancelShader()
		self:_playStyle()
	else
		self._heroAvatar:applyShader("gray")
		self:_stopPlayStyle()
	end
	self._nodeSword:setVisible(false)
	--第三阶段  只能点击
	self._isDie:setVisible(false)
	self._imageHpBg:setVisible(false)
	if  curStage == CountryBossConst.STAGE3  then
		local final_vote = G_UserData:getCountryBoss():getFinal_vote()
		if final_vote and final_vote == self._cfg.id  then
			self._nodeSword:setVisible(true)
		end

		if isBossDie then
			self._isDie:setVisible(true)
			self:stopPlayFirstRankName()
		else
			if self._isUnLock then
				self._imageHpBg:setVisible(true)
				local progress = data:getNow_hp() * 100/ data:getMax_hp()
				if progress >= 100 then
					progress = 100
				end
				self._hpBar:setPercent(progress)
			end
		end
	elseif curStage == CountryBossConst.STAGE1 then
		if self._isUnLock == true and oldIsUnLock == false then
			self._heroAvatar:playAnimationOnce("style")
		end
	end

	if self._isPlayFirstRankName then
		local firstRank = data:getRankFirst()
		if firstRank then
			local rankStr = firstRank:getGuild_name()
			self:setRankTopNodeRichString(rankStr)
		end
	end
end

function CountryBossHeroUnitNode:_createDelayAction(dt, callback)
    local delayAction = cc.DelayTime:create(dt)
	local callFuncAction = cc.CallFunc:create(callback)
	local seqAction = cc.Sequence:create(delayAction, callFuncAction)
    return seqAction
end


function CountryBossHeroUnitNode:_stopPlayStyle()
	if self._isPlaying then
		self._heroAvatar:setAction("idle", true)
	end
	self:stopAllActions()
end

function CountryBossHeroUnitNode:_playStyle()
	if self._isPlaying then
		return
	end
	self._isPlaying = true
	self._heroAvatar:playEffectOnce("style")
	self._heroAvatar:addSpineLoadHandler(function()
		self._heroAvatar:setAction("idle", true)
		self._isPlaying = false
		-- self._heroAvatar:showShadow(true)
	end)
	self:stopAllActions()
	local action  = self:_createDelayAction(math.random(10, 15), function()
		self:_playStyle()
	end)
	self:runAction(action)
end

-- Describle：
function CountryBossHeroUnitNode:onEnter()

end

-- Describle：
function CountryBossHeroUnitNode:onExit()
	self._heroAvatar:cancelShader()
end
-- Describle：
function CountryBossHeroUnitNode:_onBtnGo()
	-- -- body
	local curStage = CountryBossHelper.getStage()
	if curStage == CountryBossConst.NOTOPEN then
		G_Prompt:showTip(Lang.get("country_boss_open_tip"))
		return
	end

	local isUnlock, lockStr = CountryBossHelper.getLockString(self._cfg)
	if not isUnlock then
		G_Prompt:showTip(lockStr)
		return
	end

	if CountryBossHelper.getStage() ~= CountryBossConst.STAGE3 then
		G_Prompt:showTip(Lang.get("country_boss_not_stage3_tip", {name = self._cfg.name}))
		return
	end

	local final_vote = G_UserData:getCountryBoss():getFinal_vote()
	if final_vote ~= self._cfg.id then
		G_Prompt:showTip(Lang.get("country_boss_not_final_boss_tip"))
		return
	end

	G_SceneManager:showScene("countrybossbigboss", self._cfg.id)
end



function CountryBossHeroUnitNode:playFirstRankName()
	--
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


function CountryBossHeroUnitNode:stopPlayFirstRankName()
	if self._isPlayFirstRankName == true or self._isPlayFirstRankName == nil then
		self._isPlayFirstRankName = false
		self._rankTopNode:stopAllActions()
		self._rankTopNode:setVisible(false)
		self._rankTopNode:setOpacity(255)
		self._rankTopNode:setScale(1)
	end
end

function CountryBossHeroUnitNode:setRankTopNodeRichString(name)
	self._rankTopNode:removeAllChildren()
	local richText = ccui.RichText:createRichTextByFormatString(
		Lang.get("country_boss_first_rank_rich", {name = name}),
		{defaultColor = Colors.DARK_BG_ONE, defaultSize = 20, other ={
			[2] = {outlineColor = Colors.DARK_BG_OUTLINE}
		}})

	self._rankTopNode:addChild(richText)
end
return CountryBossHeroUnitNode
