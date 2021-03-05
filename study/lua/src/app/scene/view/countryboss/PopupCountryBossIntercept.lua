
-- Author: nieming
-- Date:2018-05-09 10:39:27
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupCountryBossIntercept = class("PopupCountryBossIntercept", PopupBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")


function PopupCountryBossIntercept:ctor(bossId)

	--csb bind var name
	self._commonNodeBk = nil  --CommonNormalSmallPop
	self._listViewItem = nil  --ListView
	self._bossId = bossId

	local resource = {
		file = Path.getCSB("PopupCountryBossIntercept", "countryboss"),

	}
	PopupCountryBossIntercept.super.ctor(self, resource)
end

-- Describle：
function PopupCountryBossIntercept:onCreate()
	self._commonNodeBk:setTitle(Lang.get("country_boss_intercept_pop_title"))
	self._commonNodeBk:addCloseEventListener(handler(self, self.close))
	self:_initListViewItem()
end

-- Describle：
function PopupCountryBossIntercept:onEnter()
	self._signalIntercept = G_SignalManager:add(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_USER_SUCCESS, handler(self, self._onEventIntecept))
	self:updateUI()
end

-- Describle：
function PopupCountryBossIntercept:onExit()
	self._signalIntercept:remove()
	self._signalIntercept = nil
end

function PopupCountryBossIntercept:onCleanup()
	G_UserData:getCountryBoss():cleanInterceptList()
end

function PopupCountryBossIntercept:_onEventIntecept(event, message)
	if(message == nil)then return end
	local reportId = rawget(message, "report")
	local function enterFightView(message)
		local cfg = CountryBossHelper.getBossConfigById(self._bossId)
		local ReportParser = require("app.fight.report.ReportParser")
		local battleReport = G_UserData:getFightReport():getReport()
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseCountryBossIntercept(message, cfg.battle_scene)
		self:close()
		G_SceneManager:showScene("fight", reportData, battleData)
	end
	G_SceneManager:registerGetReport(reportId, function() enterFightView(message) end)
    -- if battleReport == nil then
    --     return
    -- end
	-- local cfg = CountryBossHelper.getBossConfigById(self._bossId)
	-- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(battleReport)
    -- local battleData = require("app.utils.BattleDataHelper").parseCountryBossIntercept(message, cfg.battle_scene)
	-- self:close()
	-- G_SceneManager:showScene("fight", reportData, battleData)
end

function PopupCountryBossIntercept:_initListViewItem()
	-- body
	local CountryBossInterceptCell = require("app.scene.view.countryboss.CountryBossInterceptCell")
	self._listViewItem:setTemplate(CountryBossInterceptCell)
	self._listViewItem:setCallback(handler(self, self._onListViewItemItemUpdate), handler(self, self._onListViewItemItemSelected))
	self._listViewItem:setCustomCallback(handler(self, self._onListViewItemItemTouch))
end

function PopupCountryBossIntercept:updateUI()
	self._datas = G_UserData:getCountryBoss():getInterceptList() or {}
	self._listViewItem:resize(#self._datas)
end

-- Describle：
function PopupCountryBossIntercept:_onListViewItemItemUpdate(item, index)
	item:updateUI(self._datas[index + 1], index + 1)
end

-- Describle：
function PopupCountryBossIntercept:_onListViewItemItemSelected(item, index)

end

-- Describle：
function PopupCountryBossIntercept:_onListViewItemItemTouch(index, userId)
	if not userId then
		return
	end
	if CountryBossHelper.getStage() ~= CountryBossConst.STAGE3 then
		G_Prompt:showTip(Lang.get("country_boss_fight_time_end"))
		return
	end
	G_UserData:getCountryBoss():c2sInterceptCountryBossUser( userId, self._bossId)
end


return PopupCountryBossIntercept
