local ViewBase = class("ViewBase", cc.Node)
local CSHelper = require("yoka.utils.CSHelper")

ViewBase.Z_ORDER_FAR_GROUND = 1
ViewBase.Z_ORDER_GRD_BACK = 3
ViewBase.Z_ORDER_GRD_FRONT = 5

function ViewBase:waitEnterMsg(callBack)
    callBack()
end

function ViewBase:ctor(resource, sceneId,sceneSize)
    self:enableNodeEvents()

    -- check CSB resource file
    self._effectLayers = {}
    self._sceneSize = sceneSize
    self._sceneData = nil
    self._viewEffectNode = cc.Node:create()
    self:addChild(self._viewEffectNode)

    if not self._sceneSize then
       --  if  resource and resource.size then
      --      self._sceneSize = cc.size(resource.size[1],resource.size[2])
      --  else
            local size = G_ResolutionManager:getDesignCCSize()    
            self._sceneSize = cc.size(size.width,size.height)
       -- end
    end

    local ccPoint = cc.p(self._sceneSize.width*0.5, self._sceneSize.height*0.5)

    self._viewEffectNode:setPosition(ccPoint)

    self:updateSceneId(sceneId)

    if self.onInitCsb then self:onInitCsb(resource) end

    if self.onCreate then self:onCreate() end
end

function ViewBase:onInitCsb(resource)
    
    if resource then
        CSHelper.createResourceNode(self, resource)
    end
end


function ViewBase:onMoveEvent(posX)
    local sceneWidth = self._sceneSize.width
    for k,v in pairs(self._effectLayers) do
        local data = self._layerDatas[k]
        if data then
            local diffPerPix = data.differ / sceneWidth
            local backPosX = -posX * diffPerPix
            v:setPositionX(backPosX)
        end
    end
end

--直接用资源来创建场景
function ViewBase:updateSceneByRes(res,layerDatas)
    -- juntuan_back2 juntuan_back juntuan_middle juntuan_front
    res = res or {}
    layerDatas = layerDatas or {}
    self._layerDatas = layerDatas
    
    local sceneSize = nil
    local layerNum = #layerDatas
    for k,v in ipairs(res) do
        local layer = self:getEffectLayer(v.layer)
        local data = layerDatas[v.layer]
        if v.path  ~= "" then
            local start1, stop1 = string.find(v.path,"%.png$") 
            local start2, stop1 = string.find(v.path,"%.jpg$") 
            
            local node = nil
            if (start1 or start2) then
                node = cc.Sprite:create(v.path)
                node:setAnchorPoint(cc.p(0.5, 0.5))
                layer:addChild(node)
            else  
                node = G_EffectGfxMgr:createPlayMovingGfx( layer, Path.getFightSceneEffect(v.path), nil, nil ,false ) 
                node:setPosition(cc.p(0, 0))
            end

            if v.anchorPoint then
                node:setAnchorPoint(v.anchorPoint)
            end

            if v.x and v.y then
                logWarn(" ^^^^^^^^^^^^  "..v.x)
                 node:setPosition(cc.p(v.x , v.y))
            end

            if v.main then
               sceneSize = node:getContentSize()
            end
        end
     
    end
    if sceneSize then
        self._sceneSize = sceneSize
        local ccPoint = cc.p(self._sceneSize.width*0.5, self._sceneSize.height*0.5)
        self._viewEffectNode:setPosition(ccPoint)
    end
end

function ViewBase:getSceneSize()
    return self._sceneSize
end

function ViewBase:updateSceneId(sceneId)
     if sceneId then
        self:clearScene()
        local BattleScene = require("app.config.battle_scene")
        self._sceneData = BattleScene.get(sceneId)
        assert(self._sceneData, "mapData is nil, "..sceneId)
        self:_createFarGround()
        self:_createBackGround()
        self:_createFrontEffect()
    end
end

-- 清空根据sceneId创建的背景和特效
function ViewBase:clearScene()
    for k,v in pairs(self._effectLayers) do
        if k == ViewBase.Z_ORDER_FAR_GROUND or  k == ViewBase.Z_ORDER_GRD_BACK or  k == ViewBase.Z_ORDER_GRD_FRONT then
            v:removeFromParent()
            self._effectLayers[k] = nil
        end
    end
end

function ViewBase:getName()
    return self.__cname
end

function ViewBase:getResourceNode()
    return self._resourceNode
end

--获得场景层
function ViewBase:getGroundNode()
    return self:getEffectLayer(ViewBase.Z_ORDER_GRD_BACK)
    --return  self._effectLayers[ViewBase.Z_ORDER_GRD_BACK]
end

function ViewBase:getEffectLayer(layerIndex)
    if self._effectLayers[layerIndex] then
        return self._effectLayers[layerIndex]
    end
    local node = cc.Node:create()
    self._viewEffectNode:addChild(node,layerIndex)

    self._effectLayers[layerIndex] = node
    return node
end

--创建远景层
function ViewBase:_createFarGround()
    local farGround = self:getEffectLayer(ViewBase.Z_ORDER_FAR_GROUND)
   
    -- print("1112233 picName", picName)
    local picName = self._sceneData.farground
    if picName ~= "" then
        local pic = cc.Sprite:create(picName)
        pic:setAnchorPoint(cc.p(0.5, 1))
        farGround:addChild(pic)
       -- pic:setPositionY(height/2) 
        pic:setPosition(cc.p(0, G_ResolutionManager:getDesignHeight()/2))       
    end
    
    local effectName = self._sceneData.back_eft
	if effectName ~= "" then
        local effect = G_EffectGfxMgr:createPlayMovingGfx( farGround, Path.getFightSceneEffect(effectName), nil, nil ,false ) 
        effect:setPosition(cc.p(0, 0))-- effect:setPosition(cc.p(width/2, height/2))
	end
end

function ViewBase:_makeBackGroundBottom()
     local grdBack =self:getEffectLayer(ViewBase.Z_ORDER_GRD_BACK)
     local backgrdPic = grdBack:getChildByName("backgrdPic")
     if backgrdPic then
         backgrdPic:setAnchorPoint(cc.p(0.5, 0.0))
         backgrdPic:setPositionY(-320)
     end
end
-- --创建背景
function ViewBase:_createBackGround()
    local grdBack =self:getEffectLayer(ViewBase.Z_ORDER_GRD_BACK)
   
    local picName = self._sceneData.background
    if picName ~= "" then
        local pic = cc.Sprite:create(picName)
        pic:setAnchorPoint(cc.p(0.5, 0))-- pic:setAnchorPoint(cc.p(0, 0))
        pic:setPositionY(-320)
        pic:setName("backgrdPic")
        grdBack:addChild(pic)
    end

    local effectName = self._sceneData.middle_eft
	if effectName ~= "" then
        local effect = G_EffectGfxMgr:createPlayMovingGfx( grdBack, Path.getFightSceneEffect(effectName), nil, nil ,false ) 
        effect:setPosition(cc.p(0, 0))--effect:setPosition(cc.p(width/2, height/2))
	end
end

--创建前景
function ViewBase:_createFrontEffect()
    local grdFront = self:getEffectLayer(ViewBase.Z_ORDER_GRD_FRONT)

    local effectName = self._sceneData.front_eft
	if effectName ~= "" then
        local effect = G_EffectGfxMgr:createPlayMovingGfx( grdFront, Path.getFightSceneEffect(effectName), nil, nil ,false ) 
        effect:setPosition(cc.p(0, 0))-- effect:setPosition(cc.p(width/2, height/2))
	end
end


return ViewBase