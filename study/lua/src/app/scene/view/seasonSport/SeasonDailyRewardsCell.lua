-- @Author panhoa
-- @Date 8.16.2018
-- @Role

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonDailyRewardsCell = class("SeasonDailyRewardsCell", ListViewCellBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function SeasonDailyRewardsCell:ctor()
    self._imageBack     = nil
    self._textTimeAgo   = nil
    self._imageFightResult = nil
    self._btnLook       = nil

    self._textServerNum = nil
    self._textOwnName   = nil
    self._imageSword    = nil
    self._imageTitle    = nil
    self._imageStar     = nil

    local resource = {
        file = Path.getCSB("SeasonDailyRewardsCell", "seasonSport"),
        binding = {
			_btnGetAward = {
				events = {{event = "touch", method = "_onBtnGetAward"}}
			},
		},
    }
    self:setName("SeasonDailyRewardsCell")
    SeasonDailyRewardsCell.super.ctor(self, resource)
end

function SeasonDailyRewardsCell:onCreate()
    self:_updateSize()
end

function SeasonDailyRewardsCell:_updateSize()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

function SeasonDailyRewardsCell:_onBtnGetAward(sender)
    if state == ccui.TouchEventType.ended or not state then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            self:dispatchCustomCallback(self._data)
        end
    end
end

function SeasonDailyRewardsCell:_updateDesc(data)
    self._textFightCount:removeAllChildren()
    if data.type == 1 then
        local richText = ccui.RichText:createRichTextByFormatString(
        Lang.get("season_daily_fight", {num = data.num}),
        {defaultColor = Colors.NORMAL_BG_ONE, defaultSize = 20, other ={
            [1] = {fontSize = 20}
        }})
        self._textFightCount:addChild(richText)
    elseif data.type == 2 then
        local richText = ccui.RichText:createRichTextByFormatString(
        Lang.get("season_daily_win", {num = data.num}),
        {defaultColor = Colors.NORMAL_BG_ONE, defaultSize = 20, other ={
            [1] = {fontSize = 20}
        }})
        self._textFightCount:addChild(richText)
    end
end

function SeasonDailyRewardsCell:_updatePrograss(data)
    self._nodeRichText:removeAllChildren()
    if data.state == 1 then
        self._imageReceive:setVisible(true)
        self._btnGetAward:setVisible(false)
        local richText = ccui.RichText:createRichTextByFormatString(
        Lang.get("season_daily_finish_richtext", {num1 = data.num, num2 = data.num}),
        {defaultColor = Colors.NORMAL_BG_ONE, defaultSize = 18, other ={
            [1] = {fontSize = 18}
        }})
        self._nodeRichText:addChild(richText)
    else
        self._btnGetAward:setVisible(true)
        self._imageReceive:setVisible(false)
        if data.canGet then
            self._btnGetAward:setString(Lang.get("customactivity_btn_name_receive"))
            self._btnGetAward:setEnabled(true)
            self._btnGetAward:switchToNormal()
            
            local richText = ccui.RichText:createRichTextByFormatString(
            Lang.get("season_daily_finish_richtext", {num1 = data.num, num2 = data.num}),
            {defaultColor = Colors.NORMAL_BG_ONE, defaultSize = 18, other ={
                [1] = {fontSize = 18}
            }})
			self._nodeRichText:addChild(richText)
        else
            local richText = ccui.RichText:createRichTextByFormatString(
            Lang.get("season_daily_notfinish_richtext", {num1 = data.curNum, num2 = data.num}),
            {defaultColor = Colors.NORMAL_BG_ONE, defaultSize = 18, other ={
                [1] = {fontSize = 18},
            }})
            self._nodeRichText:addChild(richText)
            self._btnGetAward:setEnabled(false)
        end
    end
end

-- @Role    UpdateUI
function SeasonDailyRewardsCell:updateUI(data)
    if not data then
        return 
    end

    self._data = data
    self._fileNodeIcon:unInitUI()
    self._fileNodeIcon:initUI(SeasonSportConst.SEASON_RES_TYPE, SeasonSportConst.SEASON_RES_VALUE, data.size)
    self._fileNodeIcon:setImageTemplateVisible(true)
    self._btnGetAward:setString(Lang.get("season_daily_buy"))
    local itemParams = self._fileNodeIcon:getItemParams()
    self._textItemName:setString(itemParams.name)
	self._textItemName:setColor(itemParams.icon_color)

    self:_updateDesc(data)
    self:_updatePrograss(data)
end


return SeasonDailyRewardsCell