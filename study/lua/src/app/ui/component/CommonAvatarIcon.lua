--
-- Author: Liangxu
-- Date: 2017-12-25 14:48:55
-- 
local CommonIconBase = import(".CommonIconBase")
local CommonAvatarIcon = class("CommonAvatarIcon",CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"setType",
	"setLevel",
	"setId",
}


function CommonAvatarIcon:ctor()
	CommonAvatarIcon.super.ctor(self)
	self._avatarId = nil
	self._type = TypeConvertHelper.TYPE_AVATAR
end

function CommonAvatarIcon:_init()
	CommonAvatarIcon.super._init(self)

end

function CommonAvatarIcon:bind(target)
	CommonAvatarIcon.super.bind(self, target)
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonAvatarIcon:unbind(target)
	CommonAvatarIcon.super.unbind(self, target)
	
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonAvatarIcon:updateUI(value, size)
	local itemParams = CommonAvatarIcon.super.updateUI(self, value, size)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end
end

function CommonAvatarIcon:setType(type)
	self._type = type
end

function CommonAvatarIcon:setId(avatarId)
	self._avatarId = avatarId
end

--设置等级
function CommonAvatarIcon:setLevel(level)
	if self._textLevel == nil then
		local params = {
			name = "_textLevel",
			text = "0",
			fontSize = 20,
			color = Colors.COLOR_QUALITY[1],
			outlineColor = Colors.COLOR_QUALITY_OUTLINE[1],
		}

		local label = UIHelper.createLabel(params)
		label:setAnchorPoint(cc.p(0.5, 0.5))
		label:setPosition(cc.p(21, 10))
		
		self._textLevel = label
	end

	local equipParam = self:getItemParams()
	if self._imageLevel == nil then
		local params = {
			name = "_imageLevel",
			texture = Path.getUICommonFrame("img_iconsmithingbg_0"..equipParam.color),
		}
		local imageBg = UIHelper.createImage(params)
		imageBg:addChild(self._textLevel)
		imageBg:setAnchorPoint(cc.p(0, 1))
		imageBg:setPosition(cc.p(3, 95))

		self._imageLevel = imageBg
		self:appendUI(imageBg)
	end
	self._textLevel:setString(level)
	self._imageLevel:loadTexture(Path.getUICommonFrame("img_iconsmithingbg_0"..equipParam.color))
	self._imageLevel:setVisible(level > 0)
end

function CommonAvatarIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				if self._avatarId then
					G_SceneManager:showScene("avatar", self._avatarId)
				else
					local popup = require("app.scene.view.avatar.PopupAvatarDetail").new(TypeConvertHelper.TYPE_AVATAR, self._itemParams.cfg.id)
					popup:openWithAction()
				end
			end
		end
	end
end

return CommonAvatarIcon