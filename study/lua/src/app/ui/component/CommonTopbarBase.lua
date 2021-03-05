local CommonTopbarBase = class("CommonTopbarBase")

local EXPORTED_METHODS = {
    "setTitle",
    "updateUI",
    "setItemListVisible",
    "setImageTitle",
    "updateUIByResList",
    "setBGType",
    "hideBG",
    "setCallBackOnBack",
    "pauseUpdate",
    "resumeUpdate",
    "playEnterEffect",
    "hideBack",
    "setItemListPosX",
    "updateHelpUI"
}

CommonTopbarBase.BG_TYPE_TOTAL = 2
local PERCENT_X = {
    [1] = 1.1,
    [2] = 0.92,
    [3] = 0.75,
    [4] = 0.58
}

--
function CommonTopbarBase:ctor()
    self._target = nil
    self._textTitle = nil
    self._btnClose = nil
    self._imageTitle = nil
    self._imageBG1 = nil
    self._callbackOnBack = nil --点击返回时的回调
    -- self._dataCache = {}		--临时数据储存
end

--
function CommonTopbarBase:_init()
    self._panelBK = ccui.Helper:seekNodeByName(self._target, "Panel_bk")
    local oldSize = self._panelBK:getContentSize()
    self._panelBK:setContentSize(cc.size(G_ResolutionManager:getDesignWidth(), oldSize.height))

    self._panelDesign = ccui.Helper:seekNodeByName(self._target, "Panel_design")
    self._panelDesign:setContentSize(cc.size(G_ResolutionManager:getBangDesignWidth(), 0))
    self._panelDesign:setPositionX(G_ResolutionManager:getDesignWidth() / 2)

    self._textTitle = ccui.Helper:seekNodeByName(self._target, "textTitle")
    self._btnBack = ccui.Helper:seekNodeByName(self._target, "btnBack")
    self._imageBG1 = ccui.Helper:seekNodeByName(self._target, "Image_BG_1")
    -- self._imageBG2 = ccui.Helper:seekNodeByName(self._target, "Image_BG_2")
    -- self._imageBG = ccui.Helper:seekNodeByName(self._target, "Image_BG")
    -- -- self._imageBG2:setVisible(false)
    self._textTitle:setVisible(false)

    cc.bind(self._btnBack, "CommonButtonBack")
    self._btnBack:addClickEventListenerEx(handler(self, self.onButtonBack), true, nil, 0)

    self._btnHome = ccui.Helper:seekNodeByName(self._target, "btnHome")
    cc.bind(self._btnHome, "CommonButtonBackHome")
    self._btnHome:addClickEventListenerEx(handler(self, self.onButtonBackHome), true, nil, 0)

    self._topBarItemList = ccui.Helper:seekNodeByName(self._target, "topBarItemList")
    cc.bind(self._topBarItemList, "CommonTopbarItemList")

    self._fileHelp = ccui.Helper:seekNodeByName(self._target, "FileNode_2")
    cc.bind(self._fileHelp, "CommonHelp")


    self._imageTitle = ccui.Helper:seekNodeByName(self._target, "ImageTitle")
    self._imageTitle:ignoreContentAdaptWithSize(true)
    self._imageTitle:setVisible(false)
end

--
function CommonTopbarBase:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

--
function CommonTopbarBase:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonTopbarBase:updateUI(topBarStyle, isShowPanel)
    isShowPanel = isShowPanel or false
    self._topBarItemList:updateUI(topBarStyle, isShowPanel)
end

function CommonTopbarBase:updateUIByResList(resList, doLayout)
    self._topBarItemList:updateUIByResList(resList)
    -- if doLayout then
    -- local percentX = PERCENT_X[#resList]
    -- if percentX then
    -- 	local size = self._panelBK:getContentSize()
    -- 	local posX = size.width * percentX
    -- 	self._topBarItemList:setPositionX(posX)
    -- end
    -- end
end

function CommonTopbarBase:hideBG(...)
    -- body
    -- self._imageBG:setVisible(false)
end

--
function CommonTopbarBase:setTitle(s, size, color, outline, checkOrder)
    self._textTitle:setString(s)
    self._textTitle:setVisible(true)

    if checkOrder then
        local UTF8 = require("app.utils.UTF8")
        local len = UTF8.utf8len(s)
        if len and len >= 10 then
            self._panelDesign:setLocalZOrder(self._panelBK:getLocalZOrder() + 1)
        end
    end
    if size then
        self._textTitle:setFontSize(size)
    end
    if color then
        self._textTitle:setColor(color)
    end
    if outline then
        self._textTitle:enableOutline(outline, 1)
    end
end

--
function CommonTopbarBase:setImageTitle(imgName)
    local imgPath = Path.getTextSystemBigTab(imgName)
    self._imageTitle:loadTexture(imgPath)
    self._imageTitle:setVisible(true)
end

function CommonTopbarBase:setCallBackOnBack(callback)
    self._callbackOnBack = callback
end

--
function CommonTopbarBase:onButtonBack()
    if self._callbackOnBack then --单独控制
        self._callbackOnBack()
    else
        G_SceneManager:popScene()
    end
end

--
function CommonTopbarBase:onButtonBackHome()
    G_SceneManager:popToRootScene()
end

function CommonTopbarBase:setItemListVisible(visible)
    if visible == nil then
        visible = false
    end
    self._topBarItemList:setVisible(visible)
end

function CommonTopbarBase:setBGType(type)
    -- for i = 1, CommonTopbarBase.BG_TYPE_TOTAL,1 do
    if 1 == type then
        self["_imageBG" .. 1]:setVisible(true)
    else
        self["_imageBG" .. 1]:setVisible(false)
    end
    -- end
end

-- function CommonTopbarBase:_clearDataCache()
-- 	self._dataCache = {}
-- end

--暂停更新顶部条
function CommonTopbarBase:pauseUpdate()
    -- DataConst.RES_DIAMOND  = 1 --元宝
    -- DataConst.RES_GOLD  = 2 --银币
    -- DataConst.RES_VIT   = 3 --体力
    -- self:_clearDataCache()
    -- local UserDataHelper = require("app.utils.UserDataHelper")
    -- local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    -- local DataConst = require("app.const.DataConst")
    -- self._dataCache =
    -- {
    -- 	vit = UserDataHelper.getNumByTypeAndValue( TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT),
    -- 	gold = UserDataHelper.getNumByTypeAndValue( TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD),
    -- 	diamond = UserDataHelper.getNumByTypeAndValue( TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND),
    -- }

    self._topBarItemList:pauseUpdate()
end

--恢复顶部条更新
function CommonTopbarBase:resumeUpdate()
    -- self:_clearDataCache()
    self._topBarItemList:resumeUpdate()
end

function CommonTopbarBase:playEnterEffect()
    G_EffectGfxMgr:applySingleGfx(self._target, "smoving_shangdian_top", nil, nil, nil)
end

-- @Role 	隐藏回退按钮
function CommonTopbarBase:hideBack()
    self._btnBack:setVisible(false)
end

function CommonTopbarBase:setItemListPosX(posX)
    self._topBarItemList:setPositionX(posX)
end

function CommonTopbarBase:updateHelpUI(functionId, param)
    self._fileHelp:updateUI(functionId, param)
    self._fileHelp:setVisible(true)
end

return CommonTopbarBase
