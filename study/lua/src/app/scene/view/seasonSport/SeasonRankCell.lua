-- @Author panhoa
-- @Date 8.16.2018
-- @Role SeasonRankCell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonRankCell = class("SeasonRankCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function SeasonRankCell:ctor()
    self._fileNodeLook  = nil
    self._imageBack     = nil
    self._imageSortBack = nil
    self._imageSort     = nil
    self._textSort      = nil
    self._serverNum     = nil
    --self._imageSword    = nil
    self._imageTitle    = nil
    self._imageStar     = nil
    self._textStar      = nil
    self._fileNodeIcon  = nil
    self._fileNodeName  = nil
    self._data          = {}

    -- body
    local resource = {
        file = Path.getCSB("SeasonRankCell", "seasonSport"),
        -- binding = {
		-- 	_fileNodeLook = {
		-- 		events = {{event = "touch", method = "_onBtnLook"}}
		-- 	},
		-- }
    }
    self:setName("SeasonRankCell")
    SeasonRankCell.super.ctor(self, resource)

    self._fileNodeLook:addClickEventListenerEx(handler(self, self._onBtnLook), true, nil, 0)
end

-- @Role
function SeasonRankCell:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
    self:_initView()
end

function SeasonRankCell:_initView()
    --self._fileNodeLook:switchToNormal()
    self._fileNodeLook:setString(Lang.get("season_rank_cell_btn_text"))
end

function SeasonRankCell:_onBtnLook(sender)
    if state == ccui.TouchEventType.ended or not state then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            self:dispatchCustomCallback(self._data)
        end
    end
end

-- @Role    底图
function SeasonRankCell:_updateBack(index)
    self._textSort:setVisible(index > 3 or false)
    self._imageSort:setVisible(index <= 3 or false)

    if index <= 3 then
        self._imageBack:loadTexture(Path.getComplexRankUI(SeasonSportConst.SEASON_RANKCELL_BACK[index]))
        self._imageBack:setScale9Enabled(false)
        self._imageSortBack:loadTexture(Path.getComplexRankUI(SeasonSportConst.SEASON_RANK_BACK[index]))
        self._imageSort:loadTexture(Path.getComplexRankUI(SeasonSportConst.SEASON_RANK_SORTIMG[index]))
        self._imageBGLight:setVisible(true)
    else
        local slot = (index % 2 + 4)
        self._imageBack:loadTexture(Path.getCommonRankUI(SeasonSportConst.SEASON_RANKCELL_BACK[slot]))
        self._imageBack:setScale9Enabled(true)
        self._imageBack:setCapInsets(cc.rect(1, 1, 1, 1))
        self._imageSortBack:loadTexture(Path.getComplexRankUI(SeasonSportConst.SEASON_RANK_BACK[4]))
        self._textSort:setString(tostring(index))
        self._imageBGLight:setVisible(false)
    end
end

-- @Role    武将
function SeasonRankCell:_updateHeroIcon(data)
    self._fileNodeIcon:updateIcon(data)
end

-- @Role    名称/官衔
function SeasonRankCell:_updateNameAndOfficial(name, officialLv, gameTitle)
    self._fileNodeName:updateUI(name, officialLv)
    self._fileNodeName:setFontSize(22)
    self._fileNodeName:updateNameGap()

    local titleInfo = require("app.config.title")
    if gameTitle >= 1 and gameTitle <= titleInfo.length() then
        local titleData = titleInfo.get(gameTitle)
        local targetPosX = (self._fileNodeName:getPositionX() + self._fileNodeName:getWidth() + 5)
        self._imageHonorTitle:setPositionX(targetPosX)
        self._imageHonorTitle:loadTexture(Path.getImgTitle(titleData.resource))
        self._imageHonorTitle:ignoreContentAdaptWithSize(true)
        self._imageHonorTitle:setVisible(true)
    else
        self._imageHonorTitle:setVisible(false)
    end
end

-- @Role    服务器名/星数
function SeasonRankCell:_updateServerName(serverName)
    self._serverNum:setString(serverName)
end

-- @Role    段位/标记
function SeasonRankCell:_updateDan(star)
    local dan = SeasonSportHelper.getDanInfoByStar(star)
    local index = tonumber(dan.rank_1)
    self._textStarNum:setString(tostring(dan.star2))
    --self._imageSword:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[index]))
    self._imageTitle:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[index]))
    self._imageStar:loadTexture(Path.getSeasonStar(dan.name_pic))
end

-- @Role    UpdateUI
function SeasonRankCell:updateUI(data)
    if not data then return end

    self._data = data
    self:_updateDan(data.star)
    self:_updateBack(data.index)

    local avatarData = {
        baseId = data.base_id,
        avatarBaseId = data.avatar_base_id,
        covertId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(data.avatar_base_id, data.base_id),
        isHasAvatar = data.avatar_base_id and data.avatar_base_id > 0 
    }
    self:_updateHeroIcon(avatarData)

    if rawget(data,"head_icon_id") then
        self._fileHeadFrame:updateUI(data.head_icon_id,self._fileNodeIcon:getScale())
    end

    self:_updateNameAndOfficial(data.name, data.title, data.game_title)
    self:_updateServerName(data.sname)
end


return SeasonRankCell