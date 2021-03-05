-- @Author panhoa
-- @Date 8.17.2018
-- @Role

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonSilkListCell = class("SeasonSilkListCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function SeasonSilkListCell:ctor()
    -- body
    self._fileNodeIcon  = nil
    self._textName      = nil
    self._wearButton    = nil
    self._data          = {}

    local resource = {
        file = Path.getCSB("SeasonSilkListCell", "seasonSilk"),
        binding = {
            _wearButton = {
                events = {{event = "touch", method = "_onWear"}}
            }
        }
    }
    SeasonSilkListCell.super.ctor(self, resource)
end

function SeasonSilkListCell:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    self._wearButton:setString(Lang.get("season_silk_wear"))
    self._wearButton:switchToHightLight()
end

-- @Role    设置锦囊信息
function SeasonSilkListCell:updateUI(data)
    self._data = data
    self._fileNodeIcon:unInitUI()
    self._fileNodeIcon:initUI(TypeConvertHelper.TYPE_SILKBAG, data.id)

    local params = self._fileNodeIcon:getItemParams()
    local nameStr = data.name
	self._textName:setString(nameStr)
    self._textName:setColor(params.icon_color)
    
    if params.cfg.color == 7 then
        self._textName:enableOutline(params.icon_color_outline, 2)
    end

    if data.isWeared then
        self._wearButton:setString(Lang.get("season_silk_weared"))
        self._wearButton:switchToHightLight()
    else
        self._wearButton:setString(Lang.get("season_silk_wear"))
        self._wearButton:switchToHightLight()--switchToNormal()
    end
end

-- @Role    穿戴锦囊
function SeasonSilkListCell:_onWear(sender)
    if state == ccui.TouchEventType.ended or not state then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._data.isWeared == true then
                G_Prompt:showTip(Lang.get("season_silk_alreadyweared", {name = self._data.name}))
            else      
                self:dispatchCustomCallback(self._data)
            end
        end
    end
end


return SeasonSilkListCell