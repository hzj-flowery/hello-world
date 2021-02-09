local ViewBase = require("app.ui.ViewBase")
local UIGuideNode = import(".UIGuideNode")
local UIGuideConst = import("app.const.UIGuideConst")
local UIGuideRootNode = class("UIGuideRootNode", ViewBase)

function UIGuideRootNode:ctor()
    self._bindList = {}
    UIGuideRootNode.super.ctor(self)
    self:setName("UIGuideRootNode")
end

function UIGuideRootNode:onCreate()
end

function UIGuideRootNode:onEnter()
    logWarn("UIGuideRootNode onEnter ")
    self._signalRecvRoleInfo = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, 
        handler(self,self._onEventRecvRoleInfo))

    self:_refreshAllGuideUI()
     logWarn("UIGuideRootNode onEnter ok")
end

function UIGuideRootNode:onExit()
    logWarn("UIGuideRootNode onExit ")
    self._signalRecvRoleInfo:remove()
    self._signalRecvRoleInfo = nil
end

function UIGuideRootNode:_GUIDE_TYPE_MAIN_CITY_FIGHT(unitData)
    local CSHelper = require("yoka.utils.CSHelper")
    local node = CSHelper.loadResourceNode(Path.getCSB("CommonGuildTalk", "common"))
    -- node:setText(unitData:getConfig().text,200,true,-1)
    -- node:setScaleX(-1)
    node:setText(unitData:getConfig().text)
    return node
end

function UIGuideRootNode:_GUIDE_TYPE_CHAPTER_ICON(unitData)
    return UIGuideRootNode:_GUIDE_TYPE_STAGE_ICON(unitData)
end

function UIGuideRootNode:_GUIDE_TYPE_STAGE_ICON(unitData)
    local UIHelper  = require("yoka.utils.UIHelper")
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local effectNode = EffectGfxNode.new("effect_finger")
    effectNode:play()
    return effectNode
end

function UIGuideRootNode:_refreshAllGuideUI()
    dump(self._bindList)
     for k,v in pairs(self._bindList) do
        if v then
             self:_refreshGuide(v)
        end
       
    end
end

function UIGuideRootNode:_onEventRecvRoleInfo(event)
    self:_refreshAllGuideUI()
end

function UIGuideRootNode:_createGuideUI(guideType,param)
    logWarn("UIGuideRootNode createGuideUI "..tostring(guideType).." "..tostring(param))
    local unitData = G_UserData:getUiGuide():createUIGuideUnitData(guideType,param)
    local node = nil
    if guideType ==  UIGuideConst.GUIDE_TYPE_MAIN_CITY_FIGHT then
        node = self:_GUIDE_TYPE_MAIN_CITY_FIGHT(unitData)
    elseif guideType ==  UIGuideConst.GUIDE_TYPE_CHAPTER_ICON then
        node = self:_GUIDE_TYPE_CHAPTER_ICON(unitData)
    elseif guideType ==  UIGuideConst.GUIDE_TYPE_STAGE_ICON then
        node = self:_GUIDE_TYPE_STAGE_ICON(unitData)
    end
   
    local guideNode = UIGuideNode.new(unitData)
    if node then
        guideNode:addChild(node)
    end
    guideNode:setPosition(unitData:getConfig().x,unitData:getConfig().y)
    return guideNode
end

function UIGuideRootNode:_refreshGuide(v)
    local guideType,param,rootNode = v[1],v[2],v[3]
    local isShow = G_UserData:getUiGuide():needShowGuide(guideType,param)
    logWarn("UIGuideRootNode refreshGuide "..tostring(isShow))
    --特殊判断
    if isShow then
        self:_addGuideUI(guideType,param,rootNode)
    else
        self:_removeGuideUI(guideType,param,rootNode)     
    end
end

--注意 rootNode和UIGuideRootNode不能在同一父节点下
function UIGuideRootNode:bindUIGuide(guideType,param,rootNode)
    param = param or 0
    if not G_UserData:getUiGuide():hasUIGuide(guideType,param) then
        return
    end
    local oldBindData = self._bindList[guideType.."_"..param] 
    if oldBindData then
        self:_removeGuideUI(guideType,param,oldBindData[3])
    end
  
    
    self._bindList[guideType.."_"..param] = {guideType,param,rootNode}

    self:_refreshGuide(self._bindList[guideType.."_"..param])
end

function UIGuideRootNode:unbindUIGuide(guideType,param)
    param = param or 0
    local oldBindData = self._bindList[guideType.."_"..param] 
    if oldBindData then
         self:_removeGuideUI(guideType,param,oldBindData[3])
    end
    self._bindList[guideType.."_"..param]  = nil
end

function UIGuideRootNode:unbindAllUIGuide()
     for k,v in pairs(self._bindList) do
        self:_removeGuideUI(v[1],v[2],v[3])
    end
    self._bindList = {}
end

function UIGuideRootNode:visibleBindNode(guideType,param,visible)
    param = param or 0
    local bindData = self._bindList[guideType.."_"..param] 
    if not bindData then
        return
    end
    local rootNode = bindData[3]
    local uiGuideNode = rootNode:getChildByName("UIGuideNode")
    if uiGuideNode then
        uiGuideNode:setVisible(visible)
    end
end

function UIGuideRootNode:_addGuideUI(guideType,param,rootNode)
    param = param or 0

    local uiGuideNode = rootNode:getChildByName("UIGuideNode")
    if  uiGuideNode then
        return
    end

   -- self:_removeGuideUI(guideType,param,rootNode)

    local node = self:_createGuideUI(guideType,param)
    node:setName("UIGuideNode")
    rootNode:addChild(node)    
end

function UIGuideRootNode:_removeGuideUI(guideType,param,rootNode)
    local uiGuideNode = rootNode:getChildByName("UIGuideNode")
     logWarn("UIGuideRootNode removeGuideUI "..tostring(guideType).." "..tostring(param))
    if uiGuideNode then
        logWarn("UIGuideRootNode removeGuideUI x "..tostring(guideType).." "..tostring(param))
        uiGuideNode:removeFromParent()
        logWarn("UIGuideRootNode removeGuideUI ok "..tostring(guideType).." "..tostring(param))
    end
end

return UIGuideRootNode