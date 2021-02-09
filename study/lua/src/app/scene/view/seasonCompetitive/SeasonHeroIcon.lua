-- @Author panhoa
-- @Date 8.17.2018
-- @Role SeasonHeroIcon

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonHeroIcon = class("SeasonHeroIcon", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function SeasonHeroIcon:ctor()
    local resource = {
        file = Path.getCSB("SeasonHeroIcon", "seasonCompetitive"),
    }
    SeasonHeroIcon.super.ctor(self, resource)
end

function SeasonHeroIcon:onCreate()
    self:setContentSize(self._resource:getContentSize())
    for index = 1, 6 do
        self["_item"..index]:setVisible(false)
    end
end

-- @Role    是否可触摸
function SeasonHeroIcon:_updateEnable(index, data)
    if data.isInBanView then
        self["_panelTouch"..index]:setEnabled(data.isInBanView)
    else
        if data.isBaned then
            self["_panelTouch"..index]:setEnabled(false)
        else
            self["_panelTouch"..index]:setEnabled(not data.isMask)
        end
    end
end

-- @Role    名字、头像框颜色
function SeasonHeroIcon:_updateColor(data, index)
    local heroParam = self["_fileNodeCommon"..index]:getItemParams()
    local iconColor = heroParam.icon_color
    local iconColor_outline = heroParam.icon_color_outline
   
    local redLimit = SeasonSportHelper.getLimitBreak()
    if data.color == SeasonSportConst.HERO_SCOP_LOWERLIMIT and data.limit == SeasonSportConst.HERO_SCOP_LIMIT then
        if redLimit == SeasonSportConst.HERO_RED_LINEBREAK then
            iconColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT)
            iconColor_outline = Colors.getColorOutline(SeasonSportConst.HERO_SCOP_REDIMIT)
            local iconBg = Path.getUICommon("frame/img_frame_06")
            self["_fileNodeCommon"..index]:loadColorBg(iconBg)
        end
    end

    return iconColor, iconColor_outline
end

-- @Role    Touch Icon 
function SeasonHeroIcon:_onPanelTouch(sender, state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if sender:isEnabled() == false then
                G_Prompt:showTip(Lang.get("season_squad_selectotherhero"))
            else
                local ownSign = G_UserData:getSeasonSport():getPrior()
                local curRound = G_UserData:getSeasonSport():getCurrentRound()
                local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound) 

                if ownSign ~= tonumber(stageInfo.first) and curRound > 0 then
                    G_Prompt:showTip(Lang.get("season_squad_otherround"))
                    return
                else
                    local baseId = sender:getTag()
                    self:dispatchCustomCallback(baseId)
                end            
            end
		end
	end
end

-- @Role Update Info
function SeasonHeroIcon:updateUI(tabIndex, cellData)
    for index = 1, 6 do
        self["_item"..index]:setVisible(false)
        self["_imageSelected"..index]:setVisible(false)
    end

    -- update item
    local function updateItem(index, data)
        self["_item"..index]:setVisible(true)
        self["_fileNodeCommon"..index]:setVisible(true)
        self["_fileNodeCommon"..index]:unInitUI()

        local addStrngth = ""
        local curStage = G_UserData:getSeasonSport():getSeason_Stage()
        if curStage == SeasonSportConst.SEASON_STAGE_ROOKIE then
            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content
        elseif curStage == SeasonSportConst.SEASON_STAGE_ADVANCED then
            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content
        elseif curStage == SeasonSportConst.SEASON_STAGE_HIGHT then
            if SeasonSportHelper._isGoldenHero(data.id) then
                addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content
            else
                addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content
            end
        end

        -- Icon & Name
        local iconId = data.id
        local nameStr = (data.name.."+"..addStrngth)
        if tabIndex == 5 then   --变身卡
            nameStr = data.name
            iconId = SeasonSportHelper.getTransformCardsHeroId(data.id)
        end

        self["_fileNodeCommon"..index]:initUI(TypeConvertHelper.TYPE_HERO, iconId)
        self["_fileNodeCommon"..index]:setIconMask(data.isMask)
        self["_imageBan"..index]:setVisible(data.isBaned)
        self["_imageTop"..index]:setVisible(false)
        if data.isBaned then
            self["_fileNodeCommon"..index]:setIconMask(true)
        end
        
        -- Color
        local iconColor, iconColor_outline = self:_updateColor(data, index)
        self:_updateEnable(index, data)

        if tabIndex == 5 then   --变身卡
            iconColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT)
            local iconBg = Path.getUICommon("frame/img_frame_06")
            if data.color == 5 and data.limit == 0 then
                iconBg = Path.getUICommon("frame/img_frame_05")
                iconColor = Colors.getColor(SeasonSportConst.HERO_SCOP_LOWERLIMIT)
            end
            self["_fileNodeCommon"..index]:loadColorBg(iconBg)
        end
        self["_textHeroName"..index]:setString(nameStr)
        self["_textHeroName"..index]:setColor(iconColor)
        self["_textHeroName"..index]:enableOutline(iconColor_outline, 2)

        self["_panelTouch"..index]:setTag(data.id)
        self["_panelTouch"..index]:setSwallowTouches(false)
        self["_panelTouch"..index]:setTouchEnabled(true)
        self["_panelTouch"..index]:addClickEventListenerEx(handler(self, self._onPanelTouch))
    end

    for itemIndex, itemData in ipairs(cellData) do
        updateItem(itemIndex, itemData) 
     end
end


return SeasonHeroIcon