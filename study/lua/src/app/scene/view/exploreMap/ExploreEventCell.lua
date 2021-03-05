local ListViewCellBase = require("app.ui.ListViewCellBase")
local ExploreEventCell = class("ExploreEventCell", ListViewCellBase)

local ExploreDiscover = require("app.config.explore_discover")
local Path = require("app.utils.Path")
local ExploreConst  = require("app.const.ExploreConst")

function ExploreEventCell:ctor(eventData, pos, onClick)
    self._eventData = eventData
    self._pos = pos         --index
    self._onClick = onClick --点击函数
    self._discoverData = ExploreDiscover.get(self._eventData:getEvent_type())

    --ui
    self._imageBase = nil       --底框
    self._imageLight = nil      --选中高亮
    self._eventName = nil       --事件名字
    self._cellNode  = nil

	local resource = {
		file = Path.getCSB("ExploreEventCell", "exploreMap"),
		binding = {
            _imageBase = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	ExploreEventCell.super.ctor(self, resource)
end

function ExploreEventCell:onCreate()
    local size = self._cellNode:getContentSize()
    self:setContentSize(size)
    self._imageBase:setSwallowTouches(false)
    self._eventName:setString(self._discoverData.name)
    -- self._imageEvent:loadTexture(Path.getExploreDiscover(self._discoverData.res_id3.."_nml"))
end

--设置选中太
function ExploreEventCell:_setHighLight()
    self._imageLight:setVisible(true)
    self._eventName:setColor(ExploreConst.TAB_LIGHT_COLOR)
    -- self._eventName:setColor(self._lightColor.color)
    -- self._eventName:enableOutline(self._lightColor.outlineColor, 2)
    -- self._imageEvent:loadTexture(Path.getExploreDiscover(self._discoverData.res_id3.."_dow"))
end

--设置普通太
function ExploreEventCell:_setNormal()
    self._imageLight:setVisible(false)
    self._eventName:setColor(ExploreConst.TAB_NORMAL_COLOR)
    -- self._eventName:setColor(self._normalColor.color)
    -- self._eventName:enableOutline(self._normalColor.outlineColor, 2)
    -- self._imageEvent:loadTexture(Path.getExploreDiscover(self._discoverData.res_id3.."_nml"))
end

--设置选中框
function ExploreEventCell:setChoose(choose)
    if choose then
        self:_setHighLight()
    else
        self:_setNormal()
    end
end

--点击事件
function ExploreEventCell:_onPanelClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        self._onClick(self._pos)
	end
end


return ExploreEventCell
