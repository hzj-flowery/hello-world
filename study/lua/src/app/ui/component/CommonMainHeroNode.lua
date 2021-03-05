local CommonMainHeroNode = class("CommonMainHeroNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")

local EXPORTED_METHODS = {
    "setString",
	"updateUI",
	"updateHeroName",
	"setFuncId",
	"getFuncId",
	"setLock",
	"setAdd",
	"showRedPoint",
	"updateOfficial",
	"showImageArrow",
	"onClickCallBack",
	"showOpenLevel",
    "changeTitle",
    "setShadowVisible"
}

function CommonMainHeroNode:ctor()
	self._callback = nil
	self._funcId = nil
	self._target = nil
	self._avatar = nil
	self._heroName = nil
	self._imageLock = nil
end

function CommonMainHeroNode:_init()
	self._avatar = ccui.Helper:seekNodeByName(self._target, "CommonAvatar")
	cc.bind(self._avatar,"CommonHeroAvatar")
	self._heroName 		= ccui.Helper:seekNodeByName(self._target, "Text_heroName")
	self._imageLock = ccui.Helper:seekNodeByName(self._target, "Image_Lock")
	self._imageAdd 	= ccui.Helper:seekNodeByName(self._target,"Image_Add")
	self._heroLevel = ccui.Helper:seekNodeByName(self._target,"Text_heroLevel")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target,"Image_RedPoint")
	self._textOfficial = ccui.Helper:seekNodeByName(self._target,"Text_official")
	self._imageArrow = ccui.Helper:seekNodeByName(self._target,"ImageArrow")
	self._imageTitle = ccui.Helper:seekNodeByName(self._target,"ImageTitle")   -- 称号图片
	  
	self._textOpenLevel = ccui.Helper:seekNodeByName(self._target,"Text_open_level")

	self._heroName:setVisible(false)
	self._heroLevel:setVisible(false)
	self._avatar:setCallBack(handler(self,self.onClickCallBack))
	self._avatar:setTouchEnabled(true)
	self._avatar:setScale(0.9)
	self._imageRedPoint:setVisible(false)
	self._imageArrow:setVisible(false)
	self._imageTitle:setVisible(false)

	self:setLock(true)
end

function CommonMainHeroNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonMainHeroNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--

function CommonMainHeroNode:_isLock()
	local isLock = self._imageLock:isVisible()
	return isLock
end


function CommonMainHeroNode:_isAdd()
	local isAdd = self._imageAdd:isVisible()
	return isAdd
end

function CommonMainHeroNode:getFuncId()
	return self._funcId
end


function CommonMainHeroNode:setFuncId(funcTeamSoltId)
	self._funcId = funcTeamSoltId
	self:setLock(true)
	self:showOpenLevel(false)
end

function CommonMainHeroNode:showOpenLevel( needShow )
	-- body
	local UserDataHelper =  require("app.utils.UserDataHelper")
	local openLevel = Lang.get("team_txt_unlock_position", {level = UserDataHelper.getOpenLevelWithId(self._funcId)})
	self._textOpenLevel:setString(openLevel)
	self._textOpenLevel:setVisible(needShow)
end
function CommonMainHeroNode:setLock(needLock)
	
	needLock = needLock or false
	self._avatar:showShadow(not needLock)
	self._heroName:setVisible(false)
	self._imageLock:setVisible(false)
	self._imageAdd:setVisible(false)
	self._textOfficial:setVisible(false)


	if needLock then
		self._imageLock:setVisible(true)
	else
		self._imageAdd:setVisible(true)
		self:showOpenLevel(false)
	end
end
--

function CommonMainHeroNode:setAdd(showAdd)
	showAdd = showAdd or false
	
	self._avatar:showShadow(not showAdd)
	self._imageAdd:setVisible(showAdd)
	
end

function CommonMainHeroNode:setShadowVisible(visible)
    self._avatar:showShadow(visible)
end

function CommonMainHeroNode:onClickCallBack()

	if self:_isLock() or self._funcId == nil then
		return
	end
	if self:_isAdd() == false and self._heroId == nil then
		return 
	end
	dump(self._funcId )
	
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(self._funcId)
	
end

function CommonMainHeroNode:updateUI(heroId, isEquipAvatar, limitLevel, limitRedLevel)
	self._avatar:updateUI(heroId, nil, nil, limitLevel, nil, nil, limitRedLevel)
	self._avatar:showAvatarEffect(isEquipAvatar)

	local height = self._avatar:getHeight()

	self._heroId = heroId
	
	self._imageLock:setVisible(false)
	self._imageAdd:setVisible(false)
	self._avatar:showShadow(true)

	--设置位置
	self._heroLevel:setPositionY(height+18)
	self._imageRedPoint:setPositionY(height + 16)
	self._imageArrow:setPositionY(height + 16)

	
end

function CommonMainHeroNode:updateHeroName(heroId,heroRank, heroLevel, limitLevel, limitRedLevel)
	local heroParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, nil, heroRank, limitLevel, limitRedLevel)
	if heroParams then
		self._heroName:setString(heroParams.name)
		self._heroName:setVisible(true)
		self._heroName:setColor(heroParams.icon_color)
		self._heroName:enableOutline(heroParams.icon_color_outline,2)
	end
	if heroLevel and heroLevel > 0 then
		self._heroLevel:setString(Lang.get("common_lv",{level = heroLevel}))
		self._heroLevel:setVisible(not heroParams.isGold)
	end
	
end

function CommonMainHeroNode:setString(s)
	self._heroName:setString(s)
end

function CommonMainHeroNode:updateOfficial(officelLevel)
	officelLevel = officelLevel or G_UserData:getBase():getOfficer_level()
	local officalInfo, officalLevel = G_UserData:getBase():getOfficialInfo(officelLevel)
	if officalLevel <= 0 then --无不显示
		return
	end
	self._textOfficial:setColor(Colors.getOfficialColor(officalLevel))
	self._textOfficial:enableOutline(Colors.getOfficialColorOutline(officalLevel), 2)
	self._textOfficial:setVisible(true)
	self._textOfficial:setString("["..officalInfo.name.."]")
end

function CommonMainHeroNode:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function CommonMainHeroNode:showImageArrow(visible)
	self._imageArrow:setVisible(visible)
end

-- 显示或卸下称号
function CommonMainHeroNode:changeTitle()
	local titleItem = PopupHonorTitleHelper.getEquipedTitle() -- 获取已经装备的称号
	local titleId = titleItem and titleItem:getId() or 0
	self._avatar:showTitle(titleId,self.__cname)
end

return CommonMainHeroNode