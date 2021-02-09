-- @Author panhoa
-- @Date 8.29.2018
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local SeasonSilkIcon = class("SeasonSilkIcon", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function SeasonSilkIcon:ctor(index, callback)
    self._index = index
    self._silkData  = {}
    self._clickCallBack = callback
    
    local resource = {
        file = Path.getCSB("SeasonSilkIcon", "seasonSilk"),
        binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelTouch"}}
			},
			_btnClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},
		}
    }
	self:setName("SeasonSilkIcon")
    SeasonSilkIcon.super.ctor(self, resource)
end

function SeasonSilkIcon:onCreate()
    self._panelTouch:setSwallowTouches(true)
	self:_initView()
end

function SeasonSilkIcon:onEnter()
end

function SeasonSilkIcon:onExit()
end

-- @Role    Init View
function SeasonSilkIcon:_initView()
    self._imageMidBg:setVisible(false)
	self._imageSelected:setVisible(false)
	self._imageDark:setVisible(false)
    self._btnClose:setVisible(false)
    self._textName:setString(Lang.get("silkbag_no_wear"))
    self._textName:setColor(Colors.BRIGHT_BG_TWO)
	self._textName:enableOutline(Colors.BRIGHT_BG_OUT_LINE_TWO)
end

-- @Role    Update View
-- @Param   data
function SeasonSilkIcon:updateUI(data)
    self:_initView()
    self._silkData = data
    if data.silkId > 0 then
        local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, data.silkId)
        self._imageMidBg:loadTexture(param.icon_mid_bg2)
        self._imageIcon:loadTexture(param.icon)
        self._textName:setString(param.name)
        self._textName:setColor(param.icon_color)
        self._textName:enableOutline(param.icon_color_outline, 2)
        self._imageMidBg:setVisible(true)
        self._btnClose:setVisible(true)
    else
        self._textName:setString(Lang.get("silkbag_no_wear"))
        self._textName:setColor(Colors.BRIGHT_BG_TWO)
        self._textName:enableOutline(Colors.BRIGHT_BG_OUT_LINE_TWO)
    end
end

-- @Role    Equip effect
-- @Param   effectName
function SeasonSilkIcon:playEffect(effectName)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local subEffect = EffectGfxNode.new(effectName)
	self._nodeEffect:addChild(subEffect)
    subEffect:play()
end

-- @Role    SilkBase_Selected
-- @Param   selected
function SeasonSilkIcon:setSelected(selected)
	self._imageSelected:setVisible(selected)
end

-- @Role    Touch callback
function SeasonSilkIcon:_onPanelTouch()
	if self._clickCallBack then
		self._clickCallBack(self._index, self._silkData)
	end
end

-- @Role    Uninstall silk
function SeasonSilkIcon:_onClickClose()
    if self._silkData.silkId <= 0 then
        return
    end

    self._silkData.silkbag[self._silkData.silkPos] = 0
    G_UserData:getSeasonSport():c2sFightsSilkbagSetting(self._silkData.groupPos, self._silkData.groupName, self._silkData.silkbag)
	if self._clickCallBack then
		self._clickCallBack(self._index, self._silkData)
    end
end


return SeasonSilkIcon