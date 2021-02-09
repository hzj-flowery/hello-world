--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- 英雄头像Icon

local CommonIconBase = import(".CommonIconBase")

local CommonHeroIcon = class("CommonHeroIcon",CommonIconBase)

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local UIHelper  = require("yoka.utils.UIHelper")
local HeroConst = require("app.const.HeroConst")

local EXPORTED_METHODS = {
	"setTopImage", --setTopImage(imagePath)
	"showTopImage",
	"setQuality",	--设置品质色
	"setLevel", 
	"showHeroUnknow",	
	"updateIcon",
	"updateHeadFrame", -- 设置头像框
	"setSelected",
	"setRedPointVisible",
	"setLocked",
	"setCallBack",
	"updateHeroIcon",
	"setHeroIconMask",
}

local WIDTH_CONST = 100


function CommonHeroIcon:ctor()
	CommonHeroIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_HERO
end

function CommonHeroIcon:_init()
	CommonHeroIcon.super._init(self)
	self._imageItemTop = ccui.Helper:seekNodeByName(self._target, "ImageTop")
	self._imageUnknow = ccui.Helper:seekNodeByName(self._target, "ImageUnknow")

	-- head frame
	self._headFrameIcon = ccui.Helper:seekNodeByName(self._target, "HeadFrameIcon")
	self._headFrameSelected = ccui.Helper:seekNodeByName(self._target, "HeadFrameSelected")
	self._headFrameLock = ccui.Helper:seekNodeByName(self._target, "HeadFrameLock")
	self._redPoint = ccui.Helper:seekNodeByName(self._target,"RedPoint")
	self._tmpId = ccui.Helper:seekNodeByName(self._target, "TmpId")
	self._headFrameMask = ccui.Helper:seekNodeByName(self._target, "HeadFrameMask")

	self._moving = nil -- 头像框特效

	--self._panelItemContent:setContentSize(cc.size(WIDTH_CONST,WIDTH_CONST))

	self:showTopImage(false)
	self:setTouchEnabled(false)
end

function CommonHeroIcon:bind(target)
	CommonHeroIcon.super.bind(self, target)
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroIcon:unbind(target)
	CommonHeroIcon.super.unbind(self, target)
	
	cc.unsetmethods(target, EXPORTED_METHODS)
end

--重写refreshToEmpty
function CommonHeroIcon:refreshToEmpty(useUnknow)
	if useUnknow then
		self:loadIcon(Path.getCommonIcon("hero","999"))
		self:loadColorBg(Path.getUICommon("img_frame_empty01"),255)
	else
		CommonHeroIcon.super.refreshToEmpty(self)
	end
end

--根据传入参数，创建并，更新UI
--由于加入界限突破参数，重写此接口
function CommonHeroIcon:updateUI(value, size, limitLevel, limitRedLevel)
	if value == 0 then
		self:refreshToEmpty()
		return
	end
	self._limitLevel = limitLevel
	self._limitRedLevel = limitRedLevel
	local itemParams = TypeConvertHelper.convert(self._type, value, nil, nil, limitLevel, limitRedLevel)

	itemParams.size = size
	--加载背景框
	if itemParams.icon_bg ~= nil then
		self:loadColorBg(itemParams.icon_bg)
	end
	--加载icon
	if itemParams.icon ~= nil then
		self:loadIcon(itemParams.icon)
	end
	
	if itemParams.size then
		self:setCount(itemParams.size)
	end
	self._itemParams = itemParams
end

-- 设置玩家头像
function CommonHeroIcon:updateIcon(avatarInfo, size, frameId, scale)
	if not avatarInfo then
		return
	end
	-- dump(avatarInfo)
	if avatarInfo.isHasAvatar then
		local avatarConfig = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarInfo.avatarBaseId)
		if avatarConfig.limit == 1 then   --橙升红标记
			self:updateUI(avatarInfo.covertId, size, HeroConst.HERO_LIMIT_RED_MAX_LEVEL)--界限突破参数
		else
			self:updateUI(avatarInfo.covertId,size)		
		end
		
	else
		self:updateUI(avatarInfo.covertId,size)	
	end

	if frameId then
		self:updateHeadFrame(frameId, scale)
	end
end

-- 设置英雄头像(转换后)
function CommonHeroIcon:updateHeroIcon(baseId, size)
	if not baseId then
		return
	end

	self:updateUI(baseId, size)	
end


--设置头像框
function CommonHeroIcon:updateHeadFrame(frameId, scale)
	--local frameId = currentFrameInfo:getId()
    -- value = 0 or 1
    if not frameId or frameId <= 0 then
        -- self:refreshToEmpty()
        -- return
        frameId = 1
	end

	local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HEAD_FRAME, frameId, nil, nil, nil)
    itemParams.scale = 1--0.94
    self:setHeadFrameScale(itemParams.scale)

    --加载背景框
    if itemParams.frame ~= nil then
        self._headFrameIcon:setVisible(true)
        if self._moving ~= nil then 
            self._headFrameIcon:removeChild(self._moving)
            self._moving = nil
        end
        self:_setFrameImg(itemParams.frame)
    end
    if itemParams.moving ~= "" and itemParams.moving ~= nil  then
        self._headFrameIcon:setVisible(true)
        self:_setFrameImg(Path.getFrameIcon("img_head_frame_com001")) -- 加载一张透明的
        if self._moving ~= nil then 
            self._headFrameIcon:removeChild(self._moving)
            self._moving = nil
        end
        self._moving = G_EffectGfxMgr:createPlayGfx(self._headFrameIcon, itemParams.moving)
    end

    --self._itemParams = itemParams
end

function CommonHeroIcon:_setFrameImg( img )
    self._headFrameIcon:loadTexture(img)
end

function CommonHeroIcon:setSelected( visible )
    self._headFrameSelected:setVisible(visible)
end

function CommonHeroIcon:setLocked( visible )
    self._headFrameLock:setVisible(visible)
end

function CommonHeroIcon:setRedPointVisible( visible )
    self._redPoint:setVisible(visible)
end

function CommonHeroIcon:setHeadFrameScale( scale )
    self._headFrameIcon:setScale(WIDTH_CONST/WIDTH_CONST*scale) -- 100 是头像大小 140 是头像框大小
    self._headFrameSelected:setScale(WIDTH_CONST/WIDTH_CONST*scale) -- 120 是选中图片的大小
end

--重写  设置Icon灰色蒙层
function CommonHeroIcon:setHeroIconMask(needMask)
    --CommonHeroIcon.super.setHeroIconMask(self, needMask)
    --self._imageMask:setScale(1.1)
	--self._imageMask:setPosition(WIDTH_CONST/2,WIDTH_CONST/2)
	self._headFrameMask:setVisible(needMask)
end

--重写  icon选中
function CommonHeroIcon:setIconSelect(showSelect)
    CommonHeroIcon.super.setIconSelect(self, showSelect)
    self._imageSelect:setPosition(WIDTH_CONST/2,WIDTH_CONST/2)
end

function CommonHeroIcon:setCallBack( callback )
    CommonHeroIcon.super.setCallBack(self, callback)
end

-- 重写icon m名字
function CommonHeroIcon:setName(name)
    CommonHeroIcon.super.setName(self, name)
    self._labelItemName:setPosition(WIDTH_CONST/2,-3)
end

function CommonHeroIcon:setQuality(quality)
	local Path = require("app.utils.Path")
	local iconBg = Path.getUICommon("frame/img_frame_0"..quality)
	self:loadColorBg(iconBg)
end

function CommonHeroIcon:setLevel(level)
	if self._textLevel == nil then
		local params = {
			name = "_textLevel",
			text = "+".."0",
			fontSize = 24,
			color = Colors.COLOR_QUALITY[1],
			outlineColor = Colors.COLOR_QUALITY_OUTLINE[1],
		}

		local label = UIHelper.createLabel(params)
		label:setAnchorPoint(cc.p(0, 0))
		label:setPosition(cc.p(8,2))

		self:appendUI(label)
		self._textLevel = label
	end
	self._textLevel:setString("Lv "..level)
end

--构建顶部图片，左上角
function CommonHeroIcon:setTopImage(imgPath)

	if imgPath == nil or imgPath == "" then
		assert("image path must not be empty~~")
		return
	end


	if self._imageItemTop == nil then
		local params = {
			name = "_imageItemTop",
			texture = imgPath,
		}
		ComponentIconHelper._setPostion(params,"leftTop2")

		local uiWidget = UIHelper.createImage(params)
		uiWidget:setScale(0.75)
		self:appendUI(uiWidget)
		self._imageItemTop = uiWidget
	end

	self._imageItemTop:loadTexture(imgPath)

end

function CommonHeroIcon:showTopImage(show)
	if show == nil then
		show = false
	end
	if self._imageItemTop then
		self._imageItemTop:setVisible(show)
	end
end


function CommonHeroIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(self._target, self._itemParams, self._limitLevel, self._limitRedLevel)
			else
				if self._itemParams.cfg.type == 3 then
					local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
					PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HERO, self._itemParams.cfg.id)
					PopupItemGuider:openWithAction()
				else
					local PopupHeroDetail = require("app.scene.view.heroDetail.PopupHeroDetail").new(TypeConvertHelper.TYPE_HERO, self._itemParams.cfg.id, nil, self._limitLevel)
					PopupHeroDetail:openWithAction()
				end
			end
		end
	end
end

function CommonHeroIcon:showHeroUnknow(s)
	self._imageUnknow:setVisible(s)
	self._headFrameIcon:setVisible(not s)
end

return CommonHeroIcon