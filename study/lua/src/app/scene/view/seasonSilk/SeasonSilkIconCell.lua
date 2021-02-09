-- @Author wangyu
-- @Date 10.23.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonSilkIconCell = class("SeasonSilkIconCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSilkConst = require("app.const.SeasonSilkConst")


function SeasonSilkIconCell:ctor(index, callback)
    self._index = index
    self._silkData  = {}
    self._clickCallBack = callback
    self._resource = nil
    self._imageColor = nil
    self._imageIcon = nil
    self._nodeEffect = nil
    self._panelTouch = nil
    
    local resource = {
        file = Path.getCSB("SeasonSilkIconCell", "seasonSilk"),
        binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelTouch"}}
			},
		}
    }
	self:setName("SeasonSilkIconCell")
    SeasonSilkIconCell.super.ctor(self, resource)
end

-- @Role
function SeasonSilkIconCell:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
    self._panelTouch:setTouchEnabled(false)
    self._imageColor:setVisible(false)
end

-- @Role    Update View
-- @Param   data
function SeasonSilkIconCell:updateUI(data)
    self._silkData = data
    if data.silkId > 0 then
        local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, data.silkId)
        self._imageIcon:loadTexture(param.icon)

        local baseId = data.silkId
        self._imageColor:setVisible(true)
        local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId)
        self._imageColor:loadTexture(param.icon_mid_bg2)
        -- local effectName = SeasonSilkConst.SILK_EQUIP_EFFECTNAME[param.color]
        -- self:playEffect(effectName)
    else
        self._imageColor:setVisible(false)
    end
end

-- @Role    Equip effect
-- @Param   effectName
function SeasonSilkIconCell:playEffect(effectName)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local subEffect = EffectGfxNode.new(effectName)
	self._nodeEffect:addChild(subEffect)
    subEffect:play()
end

-- @Role    Touch callback
function SeasonSilkIconCell:_onPanelTouch()
	if self._clickCallBack then
		self._clickCallBack(self._index, self._silkData)
	end
end


return SeasonSilkIconCell