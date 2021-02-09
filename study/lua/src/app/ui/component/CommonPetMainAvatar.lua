local CommonPetMainAvatar = class("CommonPetMainAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EXPORTED_METHODS = {
    "setString",
	"updateUI",
	"updatePetName",
	"setFuncId",
	"getFuncId",
	"setLock",
	"setAdd",
	"showRedPoint",
	"showImageArrow",
	"onClickCallBack",
	"showOpenLevel",
	"updateImageBk",
	"updateScale",
	"playEffect",
	"setAvatarScale",
	"setImageScale",
	"setShadowScale",
	"setPetIndex",
	"onTeam"
}

function CommonPetMainAvatar:ctor()
	self._callback = nil
	self._funcId = nil
	self._target = nil
	self._avatar = nil
	self._petName = nil
	self._imageLock = nil
end

function CommonPetMainAvatar:_init()
	self._avatar = ccui.Helper:seekNodeByName(self._target, "CommonAvatar")
	cc.bind(self._avatar,"CommonHeroAvatar")

	self._imageLock = ccui.Helper:seekNodeByName(self._target, "Image_Lock")
	self._imageAdd 	= ccui.Helper:seekNodeByName(self._target,"Image_Add")

	self._petName 		= ccui.Helper:seekNodeByName(self._target, "Text_petName")
	self._petLevel = ccui.Helper:seekNodeByName(self._target,"Text_petLevel")
	self._panelWidget = ccui.Helper:seekNodeByName(self._target, "Panel_widget")

	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target,"Image_RedPoint")

	self._imageArrow = ccui.Helper:seekNodeByName(self._target,"ImageArrow")
	self._petStar	 = ccui.Helper:seekNodeByName(self._target,"CommonPetStar")
	self._petImageBk = ccui.Helper:seekNodeByName(self._target, "Image_bk")
	self._petStar:setVisible(false)
	self._nodeInfo = ccui.Helper:seekNodeByName(self._target, "Node_Info")

	self._textPetState = ccui.Helper:seekNodeByName(self._target, "Text_pet_state")

	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "Node_effect")


	cc.bind(self._petStar,"CommonHeroStar")
	
	self._textOpenLevel = ccui.Helper:seekNodeByName(self._target,"Text_open_level")


	self._nodeInfo:setVisible(false)
	self._petName:setVisible(false)
	self._petLevel:setVisible(false)
	self._avatar:setCallBack(handler(self,self.onClickCallBack))
	self._avatar:setTouchEnabled(true)
	
	self._avatar:setConvertType(TypeConvertHelper.TYPE_PET)
	self._avatar:setScale(0.9)
	self._avatar:setShadowScale(2.7) --神兽影子放大
	self._imageRedPoint:setVisible(false)
	self._imageArrow:setVisible(false)

	self:setLock(true)
end

function CommonPetMainAvatar:onTeam( needShow )
	-- body
	if needShow then
		self._textPetState:setString(Lang.get("pet_on_team"))
		self._textPetState:setColor(Colors.DARK_BG_THREE)
	else
		self._textPetState:setString(Lang.get("pet_on_bless"))
		self._textPetState:setColor(Colors.NUMBER_GREEN)
	end
	
end

function CommonPetMainAvatar:setPetIndex( index )

	self._textPetState:setString(Lang.get("pet_on_bless_num", {num = index}))
	self._textPetState:setColor(Colors.NUMBER_GREEN)
end


function CommonPetMainAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPetMainAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--

function CommonPetMainAvatar:_isLock()
	local isLock = self._imageLock:isVisible()
	return isLock
end


function CommonPetMainAvatar:_isAdd()
	local isAdd = self._imageAdd:isVisible()
	return isAdd
end

function CommonPetMainAvatar:getFuncId()
	return self._funcId
end

function CommonPetMainAvatar:updateImageBk( path )
	-- body
	self._petImageBk:setVisible(true)
	self._petImageBk:loadTexture(path)
end

function CommonPetMainAvatar:setFuncId(funcTeamSoltId)
	self._funcId = funcTeamSoltId
	self:setLock(true)
	self:showOpenLevel(false)
end

function CommonPetMainAvatar:showOpenLevel( needShow )
	-- body
	local UserDataHelper =  require("app.utils.UserDataHelper")
	local openLevel = Lang.get("team_txt_unlock_position", {level = UserDataHelper.getOpenLevelWithId(self._funcId)})
	self._textOpenLevel:setString(openLevel)
	self._textOpenLevel:setVisible(needShow)
end
function CommonPetMainAvatar:setLock(needLock)
	
	needLock = needLock or false
	self._avatar:showShadow(not needLock)
	self._petName:setVisible(false)
	self._imageLock:setVisible(false)
	self._imageAdd:setVisible(false)



	if needLock then
		self._imageLock:setVisible(true)
		self._avatar:setSpineVisible(false)
		self._nodeInfo:setVisible(false)
	else
		self._imageAdd:setVisible(true)
		self:showOpenLevel(false)
	end
end
--

function CommonPetMainAvatar:setAdd(showAdd)
	showAdd = showAdd or false
	
	self._avatar:showShadow(not showAdd)
	self._imageAdd:setVisible(showAdd)
	
end

function CommonPetMainAvatar:onClickCallBack()

	if self:_isLock() or self._funcId == nil then
		return
	end
	if self:_isAdd() == false and self._petId == nil then
		return 
	end
	dump(self._funcId )
	
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(self._funcId)
	
end

function CommonPetMainAvatar:updateUI(petId)

	self._avatar:updateUI(petId)

	local height = self._avatar:getHeight()

	self._petId = petId
	
	self._imageLock:setVisible(false)
	self._imageAdd:setVisible(false)
	self._avatar:showShadow(true)
	self._avatar:setSpineVisible(true)
	self._avatar:playAnimationLoopIdle()

	--设置位置
	--self._imageRedPoint:setPositionY(height + 16)
	--self._imageArrow:setPositionY(height + 16)

	
end

function CommonPetMainAvatar:updatePetName(petId, petStar, petLevel)
	local petParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, petId)
	if petParams then
		self._petName:setString(petParams.name)
		self._petName:setVisible(true)
		self._petName:setColor(petParams.icon_color)
		self._petName:enableOutline(petParams.icon_color_outline,2)
		self._nodeInfo:setVisible(true)
	end

	if petLevel and petLevel > 0 then
		self._petLevel:setString(Lang.get("pet_txt_level", {level = petLevel}))
		self._petLevel:setVisible(true)
		self._petLevel:setPositionX(0)
		local width = self._petLevel:getContentSize().width + self._petName:getContentSize().width + 5
		self._panelWidget:setContentSize(cc.size(width,self._petLevel:getContentSize().height))
		self._petName:setPositionX(self._petLevel:getContentSize().width + 5)
	end

	self._petStar:setVisible(true)
	self._petStar:setCount(petStar)
	
end

function CommonPetMainAvatar:setString(s)
	self._petName:setString(s)
end


function CommonPetMainAvatar:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function CommonPetMainAvatar:showImageArrow(visible)
	self._imageArrow:setVisible(visible)
end

function CommonPetMainAvatar:updateScale(scale )
	-- body
	local scale = 1 / scale
	self._nodeInfo:setScale(scale)
end

function CommonPetMainAvatar:setImageScale(scale)
	-- body
	self._petImageBk:setScale(scale)
end

function CommonPetMainAvatar:setAvatarScale(scale)
	-- body
	self._avatar:setScale(scale)
end
function  CommonPetMainAvatar:playEffect(effectName)
    -- body

    logWarn("show win playEffect start")
    local function eventFunction(event)
        if event == "finish" then

        end
    end
    local gfxEffect = G_EffectGfxMgr:createPlayGfx(self._nodeEffect,effectName,eventFunction)

end

--是否显示阴影
function CommonPetMainAvatar:setShadowScale(scale)
	self._avatar:setShadowScale(scale)
end

return CommonPetMainAvatar