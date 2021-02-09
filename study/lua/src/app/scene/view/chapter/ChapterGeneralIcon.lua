--名将副本的帐篷
local ViewBase = require("app.ui.ViewBase")
local ChapterGeneralIcon = class("ChapterGeneralIcon", ViewBase)

ChapterGeneralIcon.ICON_SCALE = 0.8
ChapterGeneralIcon.COLOR = 5		--默认品质

function ChapterGeneralIcon:ctor(data)
    self._data = data
    self._configData = data:getConfigData()
	local resource = {
		file = Path.getCSB("ChapterGeneralIcon", "chapter"),
		binding = {
			_panelCity = {
				events = {{event = "touch", method = "_onButtonChapterClick"}}
			},
		}
	}
	ChapterGeneralIcon.super.ctor(self, resource)
end

function ChapterGeneralIcon:onCreate()
    self:setPosition(cc.p(self._configData.position_x, self._configData.position_y))
    self._panelCity:setSwallowTouches(false)
	-- G_EffectGfxMgr:createPlayMovingGfx(self._nodeBgEffect, self._configData.island_eff, nil, nil, false )
	self:_updateHeroAvatar()
end

function ChapterGeneralIcon:onEnter()
end

function ChapterGeneralIcon:onExit()
end


function ChapterGeneralIcon:_updateHeroAvatar()
	self._nodeHero:updateUI(self._configData.show_res)
	self._nodeHero:setScale(ChapterGeneralIcon.ICON_SCALE)
	self._nodeHero:turnBack()
	self._stageName:setString(self._configData.name)
	self._stageName:setColor(Colors.getColor(ChapterGeneralIcon.COLOR))
	self._stageName:enableOutline(Colors.getColorOutline(ChapterGeneralIcon.COLOR), 1)
	local nameWidth = self._stageName:getContentSize().width
	self._imageNameBG:setContentSize(cc.size(nameWidth + 65, 33))
	local height = self._nodeHero:getHeight()
	self._nodeInfo:setPositionY(height)
	-- self._nodeInfo:setScale(ChapterGeneralIcon.ICON_SCALE)
end

function ChapterGeneralIcon:getId()
    return self._data:getId()
end

function ChapterGeneralIcon:refresh()
end

function ChapterGeneralIcon:_popupDetail()
	local popupGeneralDetail = require("app.scene.view.chapter.PopupGeneralDetail").new(self._data)
	popupGeneralDetail:openWithAction()
end

function ChapterGeneralIcon:_onButtonChapterClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:_popupDetail()
	end
end

return ChapterGeneralIcon