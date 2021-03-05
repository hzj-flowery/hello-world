--领地驻扎主页面
local ViewBase = require("app.ui.ViewBase")
local TerritoryView = class("TerritoryView", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local DataConst 	 = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TerritoryCityNode = require("app.scene.view.territory.TerritoryCityNode")

local MAX_CITY_SIZE = 6 --城市数量最大上限
function TerritoryView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	G_UserData:getTerritory():c2sGetTerritory()
    local signal = G_SignalManager:add(SignalConst.EVENT_TERRITORY_UPDATEUI, onMsgCallBack)
	return signal
end


function TerritoryView:ctor(isPopRiotInfo)
	self._scrollCityView = nil --城市底板
	self._territoryCityNode = {}
	self._isFirstEnter = true
	self._isPopRiotInfo = isPopRiotInfo
    local resource = {
        file = Path.getCSB("TerritoryView", "territory"),
        size =  G_ResolutionManager:getDesignSize(),
        binding = {
			_btnReport = {
				events = {{event = "touch", method = "_onBtnReport"}}
			},
			_btnHelper = {
				events = {{event = "touch", method = "_onBtnHelper"}}
			},
			_btnTakeAll = {
				events = {{event = "touch", method = "_onBtnTakeAll"}}
			},
		}
    }
    TerritoryView.super.ctor(self, resource)
end

function TerritoryView:onCreate()
	self._imageBG:setScale(0.76)
	self._topbarBase:setImageTitle("txt_sys_com_lingdixunluo")
	--self._topbarBase:setTitle(Lang.get("lang_territory_title"))
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self._btnReport:updateUI(FunctionConst.FUNC_RIOT_INFO)
	self._btnTakeAll:updateUI(FunctionConst.FUNC_TERRITORY_GET_ALL)
	self._btnHelper:setVisible(false)
	self._nodeEffect:setVisible(false)
	self._btnTakeAll:setVisible(false)
	
	-----------------------------------------------------------------
end


function TerritoryView:showUI(needShow)
	for i, node in ipairs(self._territoryCityNode) do
		node:showUI(needShow)
	end
end

function TerritoryView:updateUI()

	if #self._territoryCityNode == 0 then
		for i=1, MAX_CITY_SIZE do
			local scrollNode = self._scrollCityView:getSubNodeByName("Node_"..i)
			if scrollNode then
				scrollNode:removeAllChildren()
				local node = TerritoryCityNode.new()
				self._territoryCityNode[i] = node
				node:updateUI(i)
				scrollNode:addChild(node)
			end
		end
	else
		for i, node in ipairs(self._territoryCityNode) do
			node:updateUI(i)
		end
	end

end
--
function TerritoryView:playEnterEffect()
	--第一次进入才播放进入特效，否则不播放
	local function onEnterFinish()
		self:showUI(true)
		self._nodeEffect:removeAllChildren()
		G_EffectGfxMgr:createPlayGfx(self._nodeEffect,"effect_lingdihuomiao")
		G_EffectGfxMgr:createPlayGfx(self._nodeEffect,"effect_lingdidaoguang")
		self._nodeEffect:setVisible(true)
		if self._isPopRiotInfo then
			local PopupTerritoryRiotInfo = require("app.scene.view.territory.PopupTerritoryRiotInfo").new()
			PopupTerritoryRiotInfo:openWithAction()
			self._isPopRiotInfo = nil
		end
	end
	if G_UserData:getTerritory():isFirstEnter() == true then
		self._imageBG:setScale(0.76)
		self._imageBG:stopAllActions()
		self:showUI(false)
		self._nodeEffect:setVisible(false)
		local scaleTo = cc.ScaleTo:create(1,1)
		local callfunc = cc.CallFunc:create(onEnterFinish)
		local seq = cc.Sequence:create(scaleTo,callfunc)
		self._imageBG:runAction(seq)
		G_UserData:getTerritory():setFirstEnter()
	else
		self._imageBG:setScale(1.0)
		onEnterFinish()
	end
end

function TerritoryView:onEnter()



	self._signalTerritoryUpdate =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_UPDATEUI, handler(self,self._onEventTerritoryUpdate))
	self._signalTerritorySync   =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_SYNC_SINGLE_INFO, handler(self,self._onEventTerritoryUpdate))

	self._signalTerritoryFight  =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_ATTACKTERRITORY, handler(self,self._onEventTerritoryFight))
	self._signalPatrol 			 =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_PATROL, handler(self, self._onEventPatrol))
	self._signalPatrolAward 	 =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_GETAWARD, handler(self, self._onEventPartolAward))
	self._signalGetRiotAward 	 =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_GET_RIOT_AWARD, handler(self, self._onEventGetRiotAward))
	self._signalRiotHelper 	 	= G_SignalManager:add(SignalConst.EVENT_TERRITORY_FORHELP,  handler(self, self._onEventRiotHelper))

	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))

	--
	local isVisible = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_TERRITORY_GET_ALL)
	self._btnTakeAll:setVisible(isVisible)
	self._btnTakeAll:updateUI(FunctionConst.FUNC_TERRITORY_GET_ALL)

	self:updateUI()
	self:playEnterEffect()

	self:_onEventRedPointUpdate()

	if G_UserData:getTerritory():isExpired() == true then
		G_UserData:getTerritory():c2sGetTerritory()
	end
end

function TerritoryView:onExit()

	self._signalTerritoryUpdate:remove()
	self._signalTerritoryUpdate = nil

	self._signalTerritorySync:remove()
	self._signalTerritorySync = nil

	self._signalTerritoryFight:remove()
	self._signalTerritoryFight = nil

	self._signalPatrolAward:remove()
	self._signalPatrolAward = nil

	self._signalGetRiotAward:remove()
	self._signalGetRiotAward =nil

	self._signalPatrol:remove()
	self._signalPatrol = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate =nil

	self._signalRiotHelper:remove()
	self._signalRiotHelper = nil
end

function TerritoryView:_onBtnReport()
	if self._isPopRiotInfo then
		return
	end
   	local PopupTerritoryRiotInfo = require("app.scene.view.territory.PopupTerritoryRiotInfo").new()
    PopupTerritoryRiotInfo:openWithAction()
end


function TerritoryView:_onBtnTakeAll()
	
	G_UserData:getTerritory():c2sGetAllPatrolAward()
end

function TerritoryView:_onBtnHelper()

   	--local PopupTerritoryRiotHelp = require("app.scene.view.territory.PopupTerritoryRiotHelp").new()
    --PopupTerritoryRiotHelp:openWithAction()
end


function TerritoryView:_onEventRedPointUpdate(id, message)
	local RedPointHelper = require("app.data.RedPointHelper")
	local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PVE_TERRITORY, "riotRP")
	local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PVE_TERRITORY, "friendRP")

	--self._
	local function updateRedPoint(node, value)
		node:showRedPoint(value)
	end
	updateRedPoint(self._btnReport, redValue1)

	--领地巡逻奖励领过了，一件领取状态改变
	if G_UserData:getTerritory():isHavePatrolAward() == false then
		self._btnTakeAll:loadCustomIcon(Path.getCommonIcon("common","baoxiang_jubaopeng_kong"))
		self._btnTakeAll:stopFuncGfx()
	end
	--updateRedPoint(self._btnHelper, redValue2)

end

function TerritoryView:_onEventTerritoryUpdate(id, message)
	logWarn("TerritoryView:_onEventTerritoryUpdate")
	self:updateUI()
end

function TerritoryView:_onEventTerritoryFight(id, message)

	local battleReport = rawget( message, "battle_report")
	if battleReport then
		local ReportParser = require("app.fight.report.ReportParser")
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseTerritoryBattleData(message, 1)
		G_SceneManager:showScene("fight", reportData, battleData)
	end
end


function TerritoryView:_onEventPartolAward(id, message)

	self:updateUI()

	local awards = rawget(message, "awards") or {}
	local otherAwards = rawget(message, "other_awards") or {}
	local function callBackExtraReward()
		if #otherAwards > 0 then
			local DropHelper = require("app.utils.DropHelper")
			local merageAwards = DropHelper.merageAwardList(otherAwards)
			local PopupGetRewards = require("app.ui.PopupGetRewards").new()
			PopupGetRewards:showRewards(merageAwards)

		end
	end


	--只有额外奖励情况
	if #awards == 0 and #otherAwards > 0 then
		callBackExtraReward()
		return
	end

	if #awards > 0 then
		local DropHelper = require("app.utils.DropHelper")
		local merageAwards = DropHelper.merageAwardList(awards)
		local PopupGetRewards = require("app.ui.PopupGetRewards").new(callBackExtraReward)
		PopupGetRewards:showRewards(merageAwards)

	end
end

function TerritoryView:_onEventGetRiotAward(id, message)
	if message.ret ~= 1 then
		return
	end

	self:updateUI()

	local awards = rawget(message, "awards") or {}
	if #awards > 0 then
		local DropHelper = require("app.utils.DropHelper")
		local merageAwards = DropHelper.merageAwardList(awards)
		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		PopupGetRewards:showRewards(merageAwards)

	end

end

function TerritoryView:_onEventPatrol(id, message)
	local awards = rawget(message, "awards") or {}
	if #awards > 0 then
		G_Prompt:showAwards(awards)
	end
	--巡逻升级检查
	local UserCheck = require("app.utils.logic.UserCheck")
	UserCheck.isLevelUp()
	self:updateUI()
end



--收到求助事件，刷新界面
function TerritoryView:_onEventRiotHelper(id, message)

	self:updateUI()
	--self:close()
end

return TerritoryView
