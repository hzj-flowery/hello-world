local CommonIconBase = import(".CommonIconBase")
local CommonHeadFrame = class("CommonHeadFrame",CommonIconBase)

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")



local EXPORTED_METHODS = {
    "setFrameBgImg",
    "getBgImgSize",
    "setSelected",
    "setCallback",
    "updateIcon",
    "setRedPointVisible",
    "setLevel",
    "setLocked",
    "isClickFrame"
}

local WIDTH_CONST = 130

function CommonHeadFrame:ctor()
    CommonHeadFrame.super.ctor(self)
    self._type = TypeConvertHelper.TYPE_HEAD_FRAME
end

function CommonHeadFrame:_init()
    CommonHeadFrame.super._init(self)

    self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
    self._selectedBg = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
    self._tmpId = ccui.Helper:seekNodeByName(self._target, "TmpId")
    self._redPoint = ccui.Helper:seekNodeByName(self._target,"RedPoint")
    self._imageLock = ccui.Helper:seekNodeByName(self._target,"ImageLock")

    self._moving = nil -- 特效
    self._panelItemContent:setContentSize(cc.size(WIDTH_CONST,WIDTH_CONST))
end

function CommonHeadFrame:bind(target)
    CommonHeadFrame.super.bind(self, target)
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeadFrame:unbind(target)
    CommonHeadFrame.super.unbind(self, target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHeadFrame:setCallback( callback )
    CommonHeadFrame.super.setCallback(self, callback)
end

-- --重写refreshToEmpty
function CommonHeadFrame:refreshToEmpty(useUnknow)
    if useUnknow then
        self:setFrameBgImg(Path.getFrameIcon("img_head_frame_com001"))
    else
        CommonHeadFrame.super.refreshToEmpty(self)
    end
end

--根据传入参数，创建并，更新UI
function CommonHeadFrame:updateUI(value, scale)
    -- value = 0 or 1
    if value == 0 then
        -- self:refreshToEmpty()
        -- return
        value = 1
    end

    local itemParams = TypeConvertHelper.convert(self._type, value, nil, nil, nil)
    itemParams.scale = scale or 1
    self:setHeadFrameScale(itemParams.scale)

    --加载背景框
    if itemParams.frame ~= nil then
        self._imageBg:setVisible(true)
        if self._moving ~= nil then 
            self._imageBg:removeChild(self._moving)
            self._moving = nil
        end
        self:setFrameBgImg(itemParams.frame)
        -- if self._tmpId ~= nil then --  test test
        --     self._tmpId:setVisible(true)
        --     self._tmpId:setString(value)
        -- end
    end
    if itemParams.moving ~= "" and itemParams.moving ~= nil  then
        self._imageBg:setVisible(true)
        self:setFrameBgImg(Path.getFrameIcon("img_head_frame_com001")) -- 加载一张透明的
        if self._moving ~= nil then 
            self._imageBg:removeChild(self._moving)
            self._moving = nil
        end
        self._moving = G_EffectGfxMgr:createPlayGfx(self._imageBg,itemParams.moving)
    end

    self._itemParams = itemParams
end

function CommonHeadFrame:updateIcon(frameInfo,scale)
    if not frameInfo or frameInfo == nil then
        return
    end
    -- dump(frameInfo)
    self:updateUI(frameInfo:getId(),scale) 
end

function CommonHeadFrame:_onTouchCallBack(sender,state)
    -----------防止拖动的时候触发点击
    if(state == ccui.TouchEventType.ended)then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._callback then
                self._callback(self._target, self._itemParams)
            end
            if self._itemParams then
                logDebug("CommonIconBase:_onTouchCallBack : "..self._itemParams.name)
                if self._isClickFrame then
                    self:showDetailInfo()
                end
            end
        end
    end
end

function CommonHeadFrame:isClickFrame( ... )
    self._isClickFrame = true
end

function CommonHeadFrame:showDetailInfo( ... )
    local PopupFrameItemInfo = require("app.ui.PopupFrameItemInfo").new()
    PopupFrameItemInfo:updateUI(self._itemParams.cfg.id)
    PopupFrameItemInfo:openWithAction()
end

function CommonHeadFrame:setFrameBgImg( img )
    self._imageBg:loadTexture(img)
end

function CommonHeadFrame:getBgImgSize( ... )
    return self._imageBg:getContentSize()
end

function CommonHeadFrame:setSelected( visible )
    self._selectedBg:setVisible(visible)
end

function CommonHeadFrame:setLocked( visible )
    self._imageLock:setVisible(visible)
end



function CommonHeadFrame:setRedPointVisible( visible )
    self._redPoint:setVisible(visible)
end

function CommonHeadFrame:setHeadFrameScale( scale )
    self._imageBg:setScale(WIDTH_CONST/WIDTH_CONST*scale) -- 100 是头像大小 140 是头像框大小
    self._selectedBg:setScale(WIDTH_CONST/WIDTH_CONST*scale) -- 120 是选中图片的大小
end

--重写  设置Icon灰色蒙层
function CommonHeadFrame:setIconMask(needMask)
    CommonHeadFrame.super.setIconMask(self, needMask)
    self._imageMask:setScale(1.1)
    self._imageMask:setPosition(WIDTH_CONST/2,WIDTH_CONST/2)
end

--重写  icon选中
function CommonHeadFrame:setIconSelect(showSelect)
    CommonHeadFrame.super.setIconSelect(self, showSelect)
    self._imageSelect:setPosition(WIDTH_CONST/2,WIDTH_CONST/2)
end

-- 重写icon m名字
function CommonHeadFrame:setName(name)
    CommonHeadFrame.super.setName(self, name)
    self._labelItemName:setPosition(WIDTH_CONST/2,14)
end


function CommonHeadFrame:setLevel(level)

    if self._textLevel ~= nil then 
        self._imageBg:removeChild(self._textLevel)
        self._textLevel = nil
    end

    if self._textLevel == nil then
        local params = {
            name = "_textLevel",
            text = "+".."0",
            fontSize = 22,
            color = Colors.COLOR_QUALITY[1],
            outlineColor = Colors.COLOR_QUALITY_OUTLINE[1],
        }

        local label = UIHelper.createLabel(params)
        label:setAnchorPoint(cc.p(0, 0))
        -- label:setPosition(cc.p(20,15))
        label:setPosition(cc.p(22,15))
        self._imageBg:addChild(label)
        self._textLevel = label
        self._textLevel:setString("Lv "..level)
    end
    
end


return CommonHeadFrame
