-- @Author panhoa
-- @Date 9.19.2018
-- @Role

--local ViewBase = require("app.ui.ViewBase")
local PopupBase = require("app.ui.PopupBase")
local SilkSelectView = class("SilkSelectView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local SeasonSilkConst = require("app.const.SeasonSilkConst")
local SeasonSilkGroupIcon = require("app.scene.view.seasonSilk.SeasonSilkGroupIcon")


function SilkSelectView:ctor(index, dstPosition, callback)
    -- body
    self._imageView  = nil
    self._scrollView = nil
    self._imageArrow = nil
    self._silkGroupInfo = {}    -- 精囊组数据
    self._scrollViewGroup = nil   -- scroll
    self._isListViewOut = {}

    self._index     = index
    self._dstPosition = dstPosition
    self._callBack  = callback

    local resource = {
        file = Path.getCSB("SilkSelectView", "seasonCompetitive"),
    }
    self:setName("SilkSelectView")
	SilkSelectView.super.ctor(self, resource, false, true)
end

-- @Role
function SilkSelectView:onCreate()

    self._resource:setPosition(self._dstPosition)

    self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListener(handler(self, self._onClick)) --避免0.5秒间隔
    for index = 1, 6 do
        self._isListViewOut[index] = false
    end
    self:_initSilkGroupView()
end

--重写opne&close接口，避免黑底层多层时的混乱现象
function SilkSelectView:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function SilkSelectView:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
end

-- @Role
function SilkSelectView:onEnter()
    self._silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()
    self:_updateSilkGroupView()
end

-- @Role
function SilkSelectView:onExit()
end

-- @Role 	Init SilkGroup
function SilkSelectView:_onGroupItemUpdate(item, index)
    if table.nums(self._silkGroupInfo) <= 0 then
        return
    end

    local data = {}
    local curIndex = index + 1
    if self._silkGroupInfo and self._silkGroupInfo[curIndex] then
        data.pos  = curIndex
        data.isSelected = false
        data.state = SeasonSilkConst.SILK_GROUP_SATE_EQUIPPED
        if rawget(self._silkGroupInfo[curIndex], "name") ~= "" then
			data.name = self._silkGroupInfo[curIndex].name
		else
			data.name = Lang.get("season_silk_group_initname2")..tostring(curIndex)
        end

        item:updateUI(data)
    end
end

function SilkSelectView:_onGroupItemSelected(item, index)
end

-- @Role 	Touch Group
function SilkSelectView:_onGroupItemTouch(index, data)
    if self._callBack then
        self._callBack(self._index, data)
    end
    self:close()
end

-- @Role	初始化锦囊组
function SilkSelectView:_initSilkGroupView()
	local scrollViewParam = {
	    template = SeasonSilkGroupIcon,
	    updateFunc = handler(self, self._onGroupItemUpdate),
	    selectFunc = handler(self, self._onGroupItemSelected),
        touchFunc = handler(self, self._onGroupItemTouch),
    }
	self._scrollViewGroup = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

-- @Role 	Update SilkGroup
function SilkSelectView:_updateSilkGroupView()
	local maxGroup = table.nums(self._silkGroupInfo)
	if maxGroup <= 0 then
		return
	end
	
	self._scrollViewGroup:updateListView(1, maxGroup)
end

function SilkSelectView:_onClick()
    if self._callBack then
        self._callBack(self._index, nil)
    end
	self:close()
end


return SilkSelectView