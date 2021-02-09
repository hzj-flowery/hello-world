local ListViewCellBase = require("app.ui.ListViewCellBase")
local MineNewsNode = class("MineNewsNode", ListViewCellBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RichTextHelper = require("app.utils.RichTextHelper")

MineNewsNode.RICH_TEXT_MAX_WIDTH = 220

function MineNewsNode:ctor( data )
    self._data = data

    local resource = {
		file = Path.getCSB("MineNewsNode", "mineCraft"),
        binding = {
			-- _touchPanel = {
			-- 	events = {{event = "touch", method = "_onPanelClick"}}
			-- },
		}
	}
	MineNewsNode.super.ctor(self, resource)
end

function MineNewsNode:onCreate()
    local textHeight = self:_updateUI()
    
    local size = self._resourceNode:getContentSize()
    local height = size.height
    if textHeight > height then 
        height = textHeight
    end
    self:setContentSize(size.width, height)
    self._imageChannel:setPositionY(height + 5)

end

function MineNewsNode:onEnter()
end

function MineNewsNode:onExit()
end

function MineNewsNode:_updateUI()

    local PaoMaDeng = require("app.config.paomadeng")
    local cfg = PaoMaDeng.get(self._data:getSn_type())
    assert(cfg,"paomadeng not find id "..tostring(self._data:getSn_type())) 
    local strValues = {}
    for _, v in pairs(self._data:getContent()) do 
        strValues[v.key] = v.value
    end
    local str = Lang.getTxt(cfg.description, strValues)     
    
    local render = self._textContent:getVirtualRenderer()
    render:setMaxLineWidth(MineNewsNode.RICH_TEXT_MAX_WIDTH)
    self._textContent:setString(str)	

    local textHeight = self._textContent:getContentSize().height
    return textHeight
    
end

return MineNewsNode

