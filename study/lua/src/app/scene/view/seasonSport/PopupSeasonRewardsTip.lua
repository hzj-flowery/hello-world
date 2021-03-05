local PopupBase = require("app.ui.PopupBase")
local PopupSeasonRewardsTip = class("PopupSeasonRewardsTip", PopupBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")

function PopupSeasonRewardsTip:ctor(callback)
    self._fileNodeIcon1 = nil
    self._fileNodeIcon2 = nil
    self._textDanRewards1 = nil
    self._textDanRewards2 = nil
    self._imageSeasonTitle2 = nil
    self._callback = callback

	local resource = {
		file = Path.getCSB("PopupSeasonRewardsTip", "seasonSport"),
		binding = {
		}
	}
	PopupSeasonRewardsTip.super.ctor(self, resource, false, true)
end

function PopupSeasonRewardsTip:onCreate()
    --local bNew = G_UserData:getSeasonSport():isReceivedRewards()
    --self._panelSeason:setVisible(not bNew)
    self._panelSeason:setVisible(false)
    self._panelNewSeason:setVisible(true)

	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListener(handler(self, self._onClick)) --避免0.5秒间隔
end

function PopupSeasonRewardsTip:onEnter()
	self:_updateView()
end

function PopupSeasonRewardsTip:onExit()
    if self._callback then
        self._callback()
    end
end

function PopupSeasonRewardsTip:closeView()
    self:close()
end

--重写opne&close接口，避免黑底层多层时的混乱现象
function PopupSeasonRewardsTip:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function PopupSeasonRewardsTip:close()
	self:onClose()
	self.signal:dispatch("close")
    self:removeFromParent()
end

function PopupSeasonRewardsTip:_updateView()
    local curStar = G_UserData:getSeasonSport():getCurSeason_Star()
    local danInfo = SeasonSportHelper.getDanInfoByStar(curStar)
    local type, value, size = SeasonSportHelper.getFightAwardsByStar(curStar)
    if type ~= nil then
    --if G_UserData:getSeasonSport():isReceivedRewards() then
        self._fileNodeIcon1:unInitUI()
        self._fileNodeIcon1:initUI(type, value, size)
        self._fileNodeIcon1:setImageTemplateVisible(true)
        self._textDanRewards1:setString(danInfo.name ..Lang.get("season_lastrewards"))
    --[[else
        self._fileNodeIcon2:unInitUI()
        self._fileNodeIcon2:initUI(type, value, size)
        self._fileNodeIcon2:setImageTemplateVisible(true)
        self._textDanRewards2:setString(danInfo.name ..Lang.get("season_lastrewards"))
        local titleIdx = tonumber(danInfo.rank_1)
        self._imageSeasonTitle2:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[titleIdx]))
    end]]
    end
end

function PopupSeasonRewardsTip:_onClick()
	self:close()
end

return PopupSeasonRewardsTip