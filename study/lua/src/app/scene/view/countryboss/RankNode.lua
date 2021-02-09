
-- Author: nieming
-- Date:2018-05-10 14:27:27
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local RankNode = class("RankNode", ViewBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")

function RankNode:ctor(bossId)

	--csb bind var name
	self._myRankParent = nil  --SingleNode
	self._rankListView = nil  --ScrollView

	self._bossId = bossId
	self._rankDatas = {}
	local resource = {
		file = Path.getCSB("RankNode", "countryboss"),

	}
	RankNode.super.ctor(self, resource)
end

-- Describle：
function RankNode:onCreate()
	self:_initRankListView()
	self:_addMyRankNode()

end

-- Describle：
function RankNode:onEnter()

end

-- Describle：
function RankNode:onExit()

end

function RankNode:updateUI()
	local bossData = G_UserData:getCountryBoss():getBossDataById(self._bossId)

	if not bossData then
		return
	end
	self._rankDatas = bossData:getBoss_rank()
	self._rankListView:resize(#self._rankDatas)

	self._selfRankdata = bossData:getMyRankInfo()
	self._myRank:updateUI(self._selfRankdata)
end

function RankNode:_addMyRankNode()
	local RankUnitCell = require("app.scene.view.countryboss.RankUnitCell")
	local cell = RankUnitCell.new()
	self._myRankParent:addChild(cell)
	self._myRank = cell
end

function RankNode:_updateMyRank()

end

function RankNode:_initRankListView()
	-- body
	local RankUnitCell = require("app.scene.view.countryboss.RankUnitCell")
	self._rankListView:setTemplate(RankUnitCell)
	self._rankListView:setCallback(handler(self, self._onRankListViewItemUpdate), handler(self, self._onRankListViewItemSelected))
	self._rankListView:setCustomCallback(handler(self, self._onRankListViewItemTouch))

end

-- Describle：
function RankNode:_onRankListViewItemUpdate(item, index)
	item:updateUI(self._rankDatas[index + 1], index + 1)
end

-- Describle：
function RankNode:_onRankListViewItemSelected(item, index)

end

-- Describle：
function RankNode:_onRankListViewItemTouch(index, params)

end


return RankNode
