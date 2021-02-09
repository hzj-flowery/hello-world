-- @Author panhoa
-- @Date 8.16.2018
-- @Role

local ListViewCellBase = require("app.ui.ListViewCellBase")
local OwnFightReportCell = class("OwnFightReportCell", ListViewCellBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function OwnFightReportCell:ctor()
    self._imageBack     = nil
    self._textTimeAgo   = nil
    self._imageFightResult = nil
    self._btnLook       = nil

    self._textServerNum = nil
    self._textOwnName   = nil
    self._imageSword    = nil
    self._imageStar     = nil

    local resource = {
        file = Path.getCSB("OwnFightReportCell", "seasonSport"),
    }
    self:setName("OwnFightReportCell")
    OwnFightReportCell.super.ctor(self, resource)
end

function OwnFightReportCell:onCreate()
    self._btnLook:addClickEventListenerEx(handler(self,self._btnLookReport))
    self._btnLook:setString(Lang.get("season_own_fight_report_cell_btn_text"))
    self:_updateSize()
end

function OwnFightReportCell:_updateSize()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

function OwnFightReportCell:_btnLookReport(sender)
    if state == ccui.TouchEventType.ended or not state then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            self:dispatchCustomCallback(self._data)
        end
    end
end

-- @Role    底图
function OwnFightReportCell:_updateBack(index)
    local slot = (index % 2 + 4)
    self._imageBack:loadTexture(Path.getCustomActivityUI(SeasonSportConst.SEASON_REPORT_OWNBACK[slot]))
end

-- @Role    基础信息
function OwnFightReportCell:_updateBaseInfo(sid, name, officialLevel, star)
    self._textServerNum:setString(sid)

    local color   =   Colors.getOfficialColor(officialLevel)
    self._textOwnName:setString(name)
    self._textOwnName:setColor(color)
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textOwnName, officialLevel)
    
    local dan = tonumber(SeasonSportHelper.getDanInfoByStar(star).rank_1)
    local danStar = SeasonSportHelper.getDanInfoByStar(star).name_pic
    self._imageSword:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[dan]))
    self._imageStar:loadTexture(Path.getSeasonStar(danStar))
end

-- @Role    战果
function OwnFightReportCell:_updateFightResoult(bWin)
    local index = bWin and 1 or 2
    self._imageFightResult:loadTexture(Path.getBattleFont(SeasonSportConst.SEASON_REPORT_RESOULT[index]))
end

-- @Role    多久
function OwnFightReportCell:_updateFightTimePass(time)
    if time == nil or time <= 0 then
        return
    end
    local passTime = G_ServerTime:getPassTime(time)
    self._textTimeAgo:setString(passTime)
end

-- @Role    UpdateUI
function OwnFightReportCell:updateUI(data)
    if not data then
        return 
    end

    self._data = data
    self:_updateBack(data.index)
    self:_updateBaseInfo(data.sname, data.op_name, data.op_title, data.op_star)
    self:_updateFightResoult(data.is_win)
    self:_updateFightTimePass(data.report_time)
end


return OwnFightReportCell