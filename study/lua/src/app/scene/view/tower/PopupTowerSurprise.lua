local PopupBase = require("app.ui.PopupBase")
local PopupTowerSurprise = class("PopupSurprise", PopupBase)

-- local PopupStarRankNode = require("app.scene.view.stage.PopupStarRankNode")
-- local Hero = require("app.config.hero")
local Color = require("app.utils.Color")
local Path = require("app.utils.Path")
local HeroRes = require("app.config.hero_res")
local EquipBoss = require("app.config.equip_boss")

PopupTowerSurprise.BACKGROUND = {nil, nil, "blue", "purple", "orange"}

function PopupTowerSurprise:ctor(id)
	self._bossData = require("app.config.equip_boss").get(id)

	self._imageHero = nil	--英雄半身像
	self._imageBG = nil		--背景
	self._textBoss = nil	--boss信息

	self._btnChallenge = nil	--挑战按钮
	self._textTalk = nil	--对话内容
	self._imageFace = nil	--表情

	self._item1 = nil		--物品1
	self._item2 = nil		--物品2

	--signal
	self._signalSurprise = nil      --打奇遇

	local resource = {
		file = Path.getCSB("PopupTowerSurprise", "tower"),
		binding = {
			_btnChallenge = {
				events = {{event = "touch", method = "_onChallengeClick"}}
			},
		}
	}
	PopupTowerSurprise.super.ctor(self, resource)
end

function PopupTowerSurprise:onCreate()
	local heroImgId = HeroRes.get(self._bossData.res).story_res
	local res = Path.getChatRoleRes(heroImgId)
	self._imageHero:loadTexture(res)

	local quality = self._bossData.color
	local bg = Path.getTowerSurpriseBG(PopupTowerSurprise.BACKGROUND[quality])
	self._imageBG:loadTexture(bg)

	self._textBoss:setString(Lang.get("challenge_tower_surprise_title", {name = self._bossData.name, count = self._bossData.enemy_lv}))
	self._textBoss:setColor(Color.getColor(quality))
	self._textBoss:enableOutline(Color.getColorOutline(quality), 2)

	self._btnChallenge:setString(Lang.get("common_btn_challenge"))

	self._textTalk:setString(self._bossData.talk)
	if self._bossData.face == 0 then
		self._imageFace:setVisible(false)
	else
		local texFace = Path.getChatFaceRes(self._bossData.face)
		self._imageFace:loadTexture(texFace)
		self._imageFace:setVisible(true)
	end

	local DropHelper = require("app.utils.DropHelper")
	local rewards = DropHelper.getDropReward(self._bossData.drop)

	self._item1:initUI(rewards[1].type, rewards[1].value, rewards[1].size)
	self._item2:initUI(rewards[2].type, rewards[2].value, rewards[2].size)
end

function PopupTowerSurprise:onEnter()
	self._signalSurprise = G_SignalManager:add(SignalConst.EVENT_TOWER_EXECUTE_SURPRISE, handler(self, self._onEventExecuteSurprise))
end

function PopupTowerSurprise:onExit()
	self._signalSurprise:remove()
	self._signalSurprise = nil
end

function PopupTowerSurprise:_onChallengeClick()
	G_UserData:getTowerData():executeSurprise(self._bossData.id)
end

--收到攻打奇遇消息
function PopupTowerSurprise:_onEventExecuteSurprise(eventName, message)
    local surpriseData = EquipBoss.get(message.surprise_id)
    -- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(message.battle_report )
    -- local BattleDataHelper = require("app.utils.BattleDataHelper")
    -- local battleData = BattleDataHelper.parseTowerSurprise(message, surpriseData.in_res ) 
	-- if reportData:isWin() then
	-- 	self:closeWithAction()
	-- end
	-- G_SceneManager:showScene("fight", reportData, battleData) 
	local reportId = message.battle_report

    local function enterFightView()
        local ReportParser = require("app.fight.report.ReportParser")
        local battleReport = G_UserData:getFightReport():getReport()
        local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseTowerSurprise(message, surpriseData.in_res )
		if reportData:isWin() then
			self:closeWithAction()
		end
        G_SceneManager:showScene("fight", reportData, battleData)
    end
	G_SceneManager:registerGetReport(reportId, function() enterFightView() end)
  
end



return PopupTowerSurprise