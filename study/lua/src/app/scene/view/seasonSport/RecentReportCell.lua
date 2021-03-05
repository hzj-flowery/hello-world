-- @Author panhoa
-- @Date 8.16.2018
-- @Role SeasonRankCell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local RecentReportCell = class("RecentReportCell", ListViewCellBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function RecentReportCell:ctor(index, callback)
    self._resource      = nil
    self._index         = index 
    self._callback      = callback

    local resource = {
        file = Path.getCSB("RecentReportCell", "seasonSport"),
    }
    self:setName("RecentReportCell")
    RecentReportCell.super.ctor(self, resource)
end

-- @Role
function RecentReportCell:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
    self._resource:setVisible(false)
end

-- @Role    UpdateUI
function RecentReportCell:updateUI(data)
    if data == nil then
        return 
    end

    local isRookieStage = true
    self._resource:setVisible(true)
    if data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS] <= 1 then
        isRookieStage = false
        self["_imageWin"]:setVisible(data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS] == 0)
        self["_imageLose"]:setVisible(data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS] == 1)
    else
        self["_imageWin"]:setVisible(data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS] == 2)
        self["_imageLose"]:setVisible(data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS] == 3)
    end

    local idsNum = (#data.ids - 1)
    for index = 1, idsNum do
        local isOrange2Red = false
        local iconId = data.ids[index]
        if isRookieStage == false then
            local bHero, heroCfg = SeasonSportHelper.isExistHeroById(iconId)
            if heroCfg.limit_res_id ~= 0 then
                isOrange2Red =  true
                --iconId = bHero and require("app.config.hero_res").get(heroCfg.limit_res_id).icon or iconId
            end
        end
        if index <= 6 then
            self["_leftIcon"..index]:unInitUI()
            self["_leftIcon"..index]:initUI(TypeConvertHelper.TYPE_HERO, iconId)
            if isOrange2Red then
                local iconBg = Path.getUICommon("frame/img_frame_06")
                self["_leftIcon"..index]:loadColorBg(iconBg)
            end
        else
            local idx = (index - 6)
            self["_rightIcon"..idx]:unInitUI()
            self["_rightIcon"..idx]:initUI(TypeConvertHelper.TYPE_HERO, iconId)
            if isOrange2Red then
                local iconBg = Path.getUICommon("frame/img_frame_06")
                self["_rightIcon"..idx]:loadColorBg(iconBg)
            end
        end
    end
end


return RecentReportCell