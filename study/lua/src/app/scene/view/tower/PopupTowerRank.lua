local PopupBase = require("app.ui.PopupBase")
local PopupTowerRank = class("PopupTowerRank", PopupBase)

local PopupTowerRankNode = require("app.scene.view.tower.PopupTowerRankNode")
local Hero = require("app.config.hero")
local Color = require("app.utils.Color")

function PopupTowerRank:ctor()
    self._rankBase = nil            --通用排行底板
    self._listRank = nil            --排行榜list
    self._textMyRank = nil          --我的名次
    self._textMyName = nil          --我的名字
    self._textMyChapter = nil       --我的章节数
    self._textMyStar = nil          --我的星数
    -- self._imageRank = nil           --前三排名的图标
    self._myRank = nil              --我的排名icon
    self._nodeEmpty = nil           --空数据UI

    self._data = G_UserData:getTowerRankData()

	local resource = {
		file = Path.getCSB("PopupTowerRank", "tower"),
		binding = {
		}
	}
	PopupTowerRank.super.ctor(self, resource)
end

function PopupTowerRank:onCreate()
    self._rankBase:addCloseEventListener(handler(self, self._onCloseClick))
    self._rankBase:setTitle(Lang.get("challenge_tower_rank_title"))
    
    self:_setMyInfo()
    local rankData = self._data:getRankDatas()
    for _, val in pairs(rankData) do
        local popupTowerRankNode = PopupTowerRankNode.new(val)
        self._listRank:pushBackCustomItem(popupTowerRankNode)
    end
    self._nodeEmpty:setVisible(#rankData <= 0 )
end

function PopupTowerRank:onEnter()
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()
end

function PopupTowerRank:onExit()
end

function PopupTowerRank:_onCloseClick()
    self:closeWithAction()
end

--设置我的信息
function PopupTowerRank:_setMyInfo()
    local myRank = self._data:getSelfRank()
    if myRank == 0 then
        self._textMyRank:setString(Lang.get("mission_star_no_rank"))
        -- self._imageRank:setVisible(false)
        self._myRank:setVisible(false)
    elseif myRank < 4 then
        local icon = Path.getRankIcon(myRank)
        -- self._imageRank:loadTexture(icon)      
        self._textMyRank:setVisible(false)
        self._myRank:setRank(myRank)
        -- self._imageRank:setVisible(true)
    else
        self._textMyRank:setString(myRank)
        self._textMyRank:setVisible(true)
        self._myRank:setVisible(false)
        -- self._imageRank:setVisible(false)
    end

    local myName = G_UserData:getBase():getName()
    self._textMyName:setString(myName)

    local officerLevel = G_UserData:getBase():getOfficer_level()
    self._textMyName:setColor(Color.getOfficialColor(officerLevel))
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textMyName, officerLevel)

    local layer = G_UserData:getTowerData():getMax_layer()
    self._textMyChapter:setString(Lang.get("challenge_tower_rank_layer_count", {count = layer}))

    local star = G_UserData:getTowerData():getMax_star()
    self._textMyStar:setString(star)

end

return PopupTowerRank