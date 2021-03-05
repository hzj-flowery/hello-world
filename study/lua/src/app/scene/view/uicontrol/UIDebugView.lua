local PopupBase = require("app.ui.PopupBase")
local UIDebugView = class("UIDebugView", PopupBase)

local PrioritySignal = require("yoka.event.PrioritySignal")
local UIDebugViewCell = require("app.scene.view.uicontrol.UIDebugViewCell")
--
function UIDebugView:ctor()
	self:setName("UIDebugView")
	UIDebugView.super.ctor(self, nil, false)
end

function UIDebugView:onInitCsb()
	local resource = {
		file = Path.getCSB("UIDebugView", "uicontrol"),
		binding = {
            _btnClose = {
                events = {{event = "touch", method = "_onClickCancelButton"}}
            },
			_btn1 = {
                events = {{event = "touch", method = "_onClickBtn"}}
            },
			_btn2 = {
                events = {{event = "touch", method = "_onClickBtn"}}
            },
			_btn3 = {
                events = {{event = "touch", method = "_onClickBtn"}}
            },
			_btn4 = {
                events = {{event = "touch", method = "_onClickBtn"}}
            },
		}
	}
   if resource then
        local CSHelper = require("yoka.utils.CSHelper")
        CSHelper.createResourceNode(self, resource)
    end
	
end
--

function UIDebugView:open( ... )
	-- body
	self:setPosition(cc.p(math.min(1136, display.width)*0.5, math.min(640, display.height)*0.5))
	G_TopLevelNode:addToOfflineLevel(self)
end

function UIDebugView:_onClickCancelButton()
    self:close()
end

function UIDebugView:_onClickBtn(sender)

    if sender:getTag() == 1 then
		self:updateListView()
	end

	if sender:getTag() == 4 then
		self:_doCode()
	end
end

function UIDebugView:onCreate( ... )
    -- body
	for i=1, 4 do 
		self["_btn"..i]:setString(Lang.get("lang_ui_debug_btn"..i))
		self["_btn"..i]:setButtonTag(i)
	end
	
	self._dataList = {}
    local listView = self._listView
	listView:setTemplate(UIDebugViewCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))

    -- body
    local name = Lang.get("CONFIG_TUTORIAL_ENABLE2")
    if CONFIG_TUTORIAL_ENABLE == false then
        name = Lang.get("CONFIG_TUTORIAL_ENABLE1")
    end
    self._btn4:setString(name)
	
end

function UIDebugView:updateListView( ... )
	-- body
	if APP_DEVELOP_MODE then
		self._dataList = G_DebugSystem:getLogList()
		if #self._dataList > 0 then
			self._listView:resize(#self._dataList)
		end
		self._listView:jumpToPercentVertical(100)
	end
end
function UIDebugView:onEnter( ... )
	-- body
	self:updateListView()
end
function UIDebugView:_onItemUpdate(item, index)
	local data = self._dataList[index+1]
	if data then
		item:updateUI(index,data)
	end
end

function UIDebugView:_onItemSelected(item, index)

end

function UIDebugView:_onItemTouch(index, missonId)
	
end


function UIDebugView:_createTutorailButton( ... )
	-- body
	
	local CSHelper = require("yoka.utils.CSHelper")
    local button =  CSHelper.loadResourceNode(Path.getCSB("CommonButtonSwitchLevel1","common"))
    if button then



        updateButtonName()
        button:addClickEventListenerEx(switchTutorial)
        button:setName("TutorialButton")
        button:setPosition(cc.p(50,640))
        --local runningScene = display.getRunningScene()
        G_TopLevelNode:addChild(button)
    end
end

function UIDebugView:_doCode()
    local function updateButtonName( ... )
        -- body
        local name = Lang.get("CONFIG_TUTORIAL_ENABLE2")
        if CONFIG_TUTORIAL_ENABLE == false then
            name = Lang.get("CONFIG_TUTORIAL_ENABLE1")
        end
        self._btn4:setString(name)
    end
    local function switchTutorial()
        CONFIG_TUTORIAL_ENABLE = not CONFIG_TUTORIAL_ENABLE
        G_TutorialManager:setTutorialEnabled(CONFIG_TUTORIAL_ENABLE)
        updateButtonName()
    end
    updateButtonName()
    switchTutorial()
end
return UIDebugView