-- Author: zhanglinsen
-- Date:2018-09-18 20:48:28
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GroupsView = class("GroupsView", ViewBase)
local GroupsConst = require("app.const.GroupsConst")
local GroupsInfoView = require("app.scene.view.groups.GroupsInfoView")
local GroupsListView = require("app.scene.view.groups.GroupsListView")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local GroupsViewHelper = require("app.scene.view.groups.GroupsViewHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local ChatConst = require("app.const.ChatConst")
local SchedulerHelper = require("app.utils.SchedulerHelper")

function GroupsView:waitEnterMsg(callBack, param)
    local function onMsgCallBack()
        callBack()
    end
    local msgReg = G_SignalManager:add(SignalConst.EVENT_GROUP_LIST_GET, onMsgCallBack)
    if param then
        local functionId = unpack(param)
        local groupType = GroupsDataHelper.getGroupIdWithFunctionId(functionId)
        G_UserData:getGroups():c2sGetTeamsList(groupType)
    end

    return msgReg
end

function GroupsView:ctor(functionId)
    self._functionId = functionId

    local resource = {
        file = Path.getCSB("GroupsView", "groups"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {}
    }
    GroupsView.super.ctor(self, resource)
end

function GroupsView:onCreate()
    self:_initData()
    self:_initView()
end

function GroupsView:_initData()
    self._showView = {}
    self._groupType = GroupsDataHelper.getGroupIdWithFunctionId(self._functionId)
    self._showType = 0
end

function GroupsView:_initView()
    self._topbarBase:setImageTitle("txt_sys_qintombo")
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_QINTOMB)

    self._panelRoot:setCascadeOpacityEnabled(true)
    self._commonHelp:updateUI(FunctionConst.FUNC_MAUSOLEUM)
    self._btnChat:addClickEventListenerEx(handler(self, self._onOpenChatView))
end

function GroupsView:onEnter()
    self._signalGroupCreate =
        G_SignalManager:add(SignalConst.EVENT_GROUP_CREATE_SUCCESS, handler(self, self._onGroupCreate))
    self._signalMyGroupUpdate =
        G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(self, self._onMyGroupUpdate))
    self._signalLeaveSuccess =
        G_SignalManager:add(SignalConst.EVENT_GROUP_LEAVE_SUCCESS, handler(self, self._onLeaveSuccess)) --离开成功
    self._signalKickOut = G_SignalManager:add(SignalConst.EVENT_GROUP_KICK_OUT, handler(self, self._onKickOut)) --被踢出
    self._signalEnterGraveScene =
        G_SignalManager:add(SignalConst.EVENT_GRAVE_ENTER_SCENE, handler(self, self._onEventEnterGraveScene))
    self._signalGroupDissolve =
        G_SignalManager:add(SignalConst.EVENT_GROUP_DISSOLVE, handler(self, self._onGroupDissolve))
    self._signalRedPointUpdateChat =
        G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))

    self:_updateData()
    self:_updateView()
    self:_checkChatRedPoint()
    self._nodeTime:updateUIOfStatic()
end

function GroupsView:onExit()
    self._signalGroupCreate:remove()
    self._signalGroupCreate = nil
    self._signalMyGroupUpdate:remove()
    self._signalMyGroupUpdate = nil
    self._signalLeaveSuccess:remove()
    self._signalLeaveSuccess = nil
    self._signalKickOut:remove()
    self._signalKickOut = nil
    self._signalEnterGraveScene:remove()
    self._signalEnterGraveScene = nil
    self._signalGroupDissolve:remove()
    self._signalGroupDissolve = nil
    self._signalRedPointUpdateChat:remove()
    self._signalRedPointUpdateChat = nil
end

function GroupsView:_updateData()
    if G_UserData:getGroups():getMyGroupData() then
        self._showType = GroupsConst.SHOW_INFO
    else
        self._showType = GroupsConst.SHOW_LIST
    end
end

function GroupsView:_updateView()
    local curView = self._showView[self._showType]
    if curView == nil then
        if self._showType == GroupsConst.SHOW_LIST then
            curView = GroupsListView.new(self._groupType)
        elseif self._showType == GroupsConst.SHOW_INFO then
            curView = GroupsInfoView.new()
        end
        if curView then
            self._panelRoot:addChild(curView)
            self._showView[self._showType] = curView
        end
    end
    for k, subView in pairs(self._showView) do
        subView:setVisible(false)
    end
    curView:setVisible(true)
    curView:refreshView()
end

--跳转到先秦皇陵活动
function GroupsView:_onEventEnterGraveScene(...)
    --local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    --WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MAUSOLEUM)
end

function GroupsView:_onKickOut()
    self:_updateData()
    self:_updateView()
end

function GroupsView:_onGroupCreate()
    self:_updateData()
    self:_updateView()
end

function GroupsView:_onMyGroupUpdate()
    self:_updateData()
    self:_updateView()
end

function GroupsView:_onLeaveSuccess()
    self:_updateData()
    self:_updateView()
end

function GroupsView:_onGroupDissolve()
    self:_updateData()
    self:_updateView()
end

function GroupsView:_onOpenChatView()
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT)
    self._imageChatRp:setVisible(false)
end

--聊天红点
function GroupsView:_checkChatRedPoint()
    local red = RedPointHelper.isModuleReach(FunctionConst.FUNC_CHAT, ChatConst.CHANNEL_TEAM)
    self._imageChatRp:setVisible(red)
end

function GroupsView:_onEventRedPointUpdate(event, funcId)
    if funcId == FunctionConst.FUNC_CHAT then
        self:_checkChatRedPoint()
    end
end

return GroupsView
