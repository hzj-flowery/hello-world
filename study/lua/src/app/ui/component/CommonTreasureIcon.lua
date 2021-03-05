--
-- Author: Liangxu
-- Date: 2017-02-20 17:51:01
--宝物Icon

local CommonIconBase = import(".CommonIconBase")

local CommonTreasureIcon = class("CommonTreasureIcon", CommonIconBase)

local UIHelper = require("yoka.utils.UIHelper")

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"setTopNum",
	"setLevel",
	"setRlevel",
	"setId",
	"updateJadeSlot",
}

CommonTreasureIcon.R_LEVEL_NORMAL_POSY = 20 -- 精炼等级正常时y坐标
CommonTreasureIcon.R_LEVEL_JADE_POSY = 26 -- 精炼等级有玉石槽y坐标

function CommonTreasureIcon:ctor()
	CommonTreasureIcon.super.ctor(self)
	self._textItemTopNum = nil -- 顶部数字按钮
	self._type = TypeConvertHelper.TYPE_TREASURE
	self._id = nil
end

function CommonTreasureIcon:_init()
	CommonTreasureIcon.super._init(self)
	self:setTouchEnabled(false)
end

function CommonTreasureIcon:bind(target)
	CommonTreasureIcon.super.bind(self, target)

	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTreasureIcon:unbind(target)
	CommonTreasureIcon.super.unbind(self, target)

	cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonTreasureIcon:setId(id)
	self._id = id
end


--根据传入参数，创建并，更新UI
function CommonTreasureIcon:updateUI(value, size)
    local itemParams = CommonTreasureIcon.super.updateUI(self, value, size)
	self._value = value

	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end

	if self._textRlevel then
        self._textRlevel:setPositionY(CommonTreasureIcon.R_LEVEL_NORMAL_POSY)
    end

end

function CommonTreasureIcon:setTopNum(size)
	if self._textItemTopNum == nil then
		local params = {
			name = "_textItemTopNum",
			text = "x".."0",
			fontSize = 18,
			color = Colors.WHITE_DEFAULT,
			outlineColor = Colors.DEFAULT_OUTLINE_COLOR,
		}
		ComponentIconHelper._setPostion(params,"leftTop")

		local uiWidget = UIHelper.createLabel(params)

		self:appendUI(uiWidget)
		self._textItemTopNum = uiWidget
	end
	self._textItemTopNum:setString(""..size)
	self._textItemTopNum:setVisible( size > 0 ) 
end

--设置强化等级
function CommonTreasureIcon:setLevel(level)
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
		label:setPosition(cc.p(18, 10))
		
		self._textLevel = label
	end

	local itemParam = self:getItemParams()
	if self._imageLevel == nil then
		local params = {
			name = "_imageLevel",
			texture = Path.getUICommonFrame("img_iconsmithingbg_0"..itemParam.color),
		}
		local imageBg = UIHelper.createImage(params)
		imageBg:addChild(self._textLevel)
		imageBg:setAnchorPoint(cc.p(0, 1))
		imageBg:setPosition(cc.p(0, 95))

		self._imageLevel = imageBg
		self:appendUI(imageBg)
	end
	self._textLevel:setString(level)
	self._textLevel:enableOutline(Colors.COLOR_QUALITY_OUTLINE[itemParam.color])
	self._imageLevel:loadTexture(Path.getUICommonFrame("img_iconsmithingbg_0"..itemParam.color))
	self._imageLevel:setVisible(level > 0)
end

--设置精炼等级
function CommonTreasureIcon:setRlevel(rLevel)
	if self._textRlevel == nil then
		local params = {
			name = "_textRlevel",
			text = "+".."0",
			fontSize = 20,
			color = Colors.COLOR_QUALITY[2],
			outlineColor = Colors.COLOR_QUALITY_OUTLINE[2],
		}

		local label = UIHelper.createLabel(params)
		label:setAnchorPoint(cc.p(0.5, 0.5))
		label:setPosition(cc.p(46, 13))

		self:appendUI(label)
		self._textRlevel = label
	end
	self._textRlevel:setString("+"..rLevel)
	self._textRlevel:setVisible(rLevel > 0)
end

-- 玉石槽
function CommonTreasureIcon:updateJadeSlot(jadeDatas, heroBaseId)
    local nodeJadeSlot = ccui.Helper:seekNodeByName(self._target, "NodeJadeSlot")
    if not nodeJadeSlot then
        return false
    end
    nodeJadeSlot:setVisible(false)
    if not jadeDatas then
        return false
    end
    local TreasureConst = require("app.const.TreasureConst")
	local config = require("app.config.treasure").get(self._value)
	local function canInjectJade(baseId)
		local config = require("app.config.treasure").get(baseId)
		local jadeList = string.split(config.inlay_type, "|")
		for k, v in pairs(jadeList) do
			if v ~= "0" then
				return true
			end
		end
		return false
	end
    if config and canInjectJade(self._value) then
        nodeJadeSlot:setVisible(true)
        if self._textRlevel then
            self._textRlevel:setPositionY(CommonTreasureIcon.R_LEVEL_JADE_POSY)
        end
        local imageSlot = nodeJadeSlot:getChildByName("imageSlot")
        if not imageSlot then
            imageSlot = UIHelper.createImage({name = "imageSlot", adaptWithSize = true})
            nodeJadeSlot:addChild(imageSlot)
        end
        imageSlot:loadTexture(Path.getJadeImg(TreasureConst.TREASURE_JADE_SLOT_BG[config.color]))
        imageSlot:removeAllChildren()
        self:_addJadeSlot(jadeDatas, imageSlot, heroBaseId, config)
        return true
    end
    return false
end


function CommonTreasureIcon:_addJadeSlot(jadeDatas, imageSlot, heroBaseId, config)
    for i, v in pairs(jadeDatas) do
        if jadeDatas[i] > 0 then
            local jconfig = require("app.config.jade").get(jadeDatas[i])
            if jconfig then
                local texture = Path.getJadeImg("img_jade_" .. jconfig.color)
                local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
                local isActive = EquipJadeHelper.isSuitableHero(jconfig, heroBaseId)
                if not isActive then
                    texture = Path.getJadeImg("img_jade_7")
                end
                local slot =
                    UIHelper.createImage(
                    {
                        name = "slot" .. i,
                        texture = texture,
                        adaptWithSize = true
                    }
                )
                local TreasureConst = require("app.const.TreasureConst")
                slot:setPosition(TreasureConst.TREASURE_JADE_SLOT_POS[config.color][i])
                imageSlot:addChild(slot)
            end
        end
    end
end

function CommonTreasureIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				if self._itemParams.cfg.treasure_type == 0 then
					local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
					PopupItemGuider:updateUI(TypeConvertHelper.TYPE_TREASURE, self._itemParams.cfg.id)
					PopupItemGuider:openWithAction()
				else
					--local popup = require("app.scene.view.heroDetail.PopupHeroDetail").new(TypeConvertHelper.TYPE_HERO ,self._itemParams.cfg.id)
					--popup:openWithAction()

					local PopupTreasureDetail = require("app.scene.view.treasureDetail.PopupTreasureDetail").new(
						TypeConvertHelper.TYPE_TREASURE,self._itemParams.cfg.id)
	    			PopupTreasureDetail:openWithAction()

				end
			end
		end
	end
end

return CommonTreasureIcon