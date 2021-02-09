-- @Author panhoa
-- @Date 8.29.2018
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonSilkGroupIcon = class("SeasonSilkGroupIcon", ListViewCellBase)
local Color = require("app.utils.Color")


function SeasonSilkGroupIcon:ctor()
    self._imageSelected  = nil   -- 选中
    self._silkEquipped   = nil   -- 已装备
    self._silkUnEquip    = nil   -- 未装备
    self._silkLock       = nil   -- 未解锁
    self._textGroupName  = nil   -- 名称
    self._textGroupIndex = nil   -- 序号
    self._data           = {}    -- 当前item data
	
    local resource = {
        file = Path.getCSB("SeasonSilkGroupIcon", "seasonSilk"),
        binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onBtnTouchGroup"}}
			},
		}
    }
	self:setName("SeasonSilkGroupIcon")
    SeasonSilkGroupIcon.super.ctor(self, resource)
end

function SeasonSilkGroupIcon:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    
    -- 调整上阵界面的UI
    if G_UserData:getSeasonSport():getInSeasonSilkView() == false then
        local positionX = self._resourceNode:getPositionX()
        local positionY = self._resourceNode:getPositionY()
        self._resourceNode:setPositionX(positionX - 5)
        self._resourceNode:setPositionY(positionY + 5)
    end

    self._panelTouch:setSwallowTouches(false)
    self._silkLock:setVisible(true)
    self._silkUnEquip:setVisible(false) 
    self._silkEquipped:setVisible(false)
    self._imageSelected:setVisible(false)
end

-- @Role    设置锦囊组信息
function SeasonSilkGroupIcon:updateUI(data)
    self._data = data
    -- if data.state == 2 or data.state == 1 then
    --     self._silkUnEquip:setVisible(true)
    -- else
    --     self._silkUnEquip:setVisible(false)
    -- end
    
    self._silkLock:setVisible(data.state == 0 or false) 
    -- self._silkEquipped:setVisible(data.state == 3 or false)
    self._silkEquipped:setVisible(data.isSelected)
    self._imageSelected:setVisible(data.isSelected)
    self._textGroupName:setString(data.name)
    self._textGroupName:setVisible(data.state ~= 0 or false)
    self._textGroupName:setColor(data.isSelected and Colors.getFTypeRed() or Colors.getATypeYellow())
    self._textGroupIndex:setString(tostring(data.pos))
end

-- @Role    锦囊组触摸响应回调
function SeasonSilkGroupIcon:_onBtnTouchGroup(sender, state)
    if state == ccui.TouchEventType.ended or not state then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then      
            self:dispatchCustomCallback(self._data)
        end
    end
end

-- @Role    锦囊组选中高亮
function SeasonSilkGroupIcon:setSelected(isVisible)
    self._imageSelected:setVisible(isVisible)
end


return SeasonSilkGroupIcon