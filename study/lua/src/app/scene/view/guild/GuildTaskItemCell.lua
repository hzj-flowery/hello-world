
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildTaskItemCell = class("GuildTaskItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
function GuildTaskItemCell:ctor()
    self._resourceNode = nil
    self._textTaskName = nil
    self._textTaskDesc2 = nil
    self._textReputationValue = nil
    self._nodeProgress = nil
    self._buttonOK = nil
    self._imageComplete = nil
    self._textTips = nil
    self._data = nil
	local resource = {
		file = Path.getCSB("GuildTaskItemCell", "guild"),
		binding = {
            _panelTouch = {events = {{event = "touch", method = "_onClickCallBack"}}},
            _buttonOK = {events = {{event = "touch", method = "_onClickCallBack"}}}
		}
	}
	GuildTaskItemCell.super.ctor(self, resource)
end

function GuildTaskItemCell:onCreate()
    local x,y = self._resourceNode:getPosition()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height + y)
    

    self._buttonOK:setString(Lang.get("common_btn_goto"))
end

--GuildTaskUnitData
function GuildTaskItemCell:update(data)
    self._data = data
  

    local config = data:getConfig()
    local people = data:getPeople()
    local exp = data:getExp()
    local maxPeople = config.max_active
    local isHasComplete = UserDataHelper.isGuildTaskHasComplete(config.type)
    local isProgressFull = people >= maxPeople

    self._textTaskName:setString(config.name)
    self._textTaskDesc2:setString(Lang.get("guild_task_reputation_desc",{value = config.name}))
    self._textReputationValue:setString(tostring(exp))
      
    local richText = Lang.get("guild_task_people_progress",
			{value = people,max = maxPeople,valueColor =  Colors.colorToNumber(Colors.BRIGHT_BG_GREEN),
            maxColor =  Colors.colorToNumber(isProgressFull and Colors.BRIGHT_BG_GREEN or  Colors.BRIGHT_BG_ONE)})
    self:_createProgressRichText(richText)

    

    if config.function_id > 0 then
        local funInfo = require("app.config.function_level").get(config.function_id)
        assert(funInfo, "function_level can not find id "..tostring(config.function_id))

        self._imageIcon:loadTexture(Path.getCommonIcon("main",funInfo.icon))
        self._imageIcon:ignoreContentAdaptWithSize(true)    
    end

    self:_openTask(data:getConfig().is_open == 1)

    if data:getConfig().is_open ~= 1 then
        return
    end
  
    local showSkip = config.function_id > 0 and (not isHasComplete)
    self._buttonOK:setVisible(showSkip)
    self._imageComplete:setVisible(isHasComplete)
    self._panelTouch:setTouchEnabled(showSkip)
    
   

   
end


function GuildTaskItemCell:_openTask(visible)
    self._nodeProgress:setVisible(visible)
    self._textTaskDesc2:setVisible(visible)
    self._textReputationValue:setVisible(visible)
    self._textTips:setVisible(not visible)
    self._buttonOK:setVisible(visible)
    self._imageComplete:setVisible(false)
end

function GuildTaskItemCell:_onGoHandler( sender,state )
end

function GuildTaskItemCell:_onClickCallBack(sender)
    local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        
        local config = self._data:getConfig()
        self:_gotoFunc(config.function_id)
	end
end


--创建富文本
function GuildTaskItemCell:_createProgressRichText(richText)
	self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0,0.5))
    self._nodeProgress:addChild(widget)
end

--跳转函数
function GuildTaskItemCell:_gotoFunc( funcId )
	if funcId > 0 then
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        if funcId == FunctionConst.FUNC_GUILD_HELP then
            WayFuncDataHelper.gotoModuleByFuncId(funcId,true)--标志从军团主场景跳转
        else
            WayFuncDataHelper.gotoModuleByFuncId(funcId)    
        end
        
    end

end

return GuildTaskItemCell