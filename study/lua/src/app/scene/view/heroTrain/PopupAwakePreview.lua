--
-- Author: Liangxu
-- Date: 2018-8-1 16:56:41
-- 武将觉醒预览弹框
local PopupBase = require("app.ui.PopupBase")
local PopupAwakePreview = class("PopupAwakePreview", PopupBase)
local PopupAwakePreviewCell = require("app.scene.view.heroTrain.PopupAwakePreviewCell")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function PopupAwakePreview:ctor(heroUnitData)
	self._heroUnitData = heroUnitData

	local resource = {
		file = Path.getCSB("PopupAwakePreview", "hero"),
		binding = {
			
		}
	}
	PopupAwakePreview.super.ctor(self, resource)
end

function PopupAwakePreview:onCreate()
	self._panelBg:setTitle(Lang.get("hero_awake_preview_title"))
	self._panelBg:addCloseEventListener(handler(self, self._onButtonClose))

	self._listView:setTemplate(PopupAwakePreviewCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupAwakePreview:onEnter()
	self:_updateView()
end

function PopupAwakePreview:onExit()
	
end

function PopupAwakePreview:_updateView()
	self._previewData = HeroDataHelper.getAwakeGemstonePreviewInfo(self._heroUnitData)
	self._listView:resize(#self._previewData)
end

function PopupAwakePreview:_onButtonClose()
	self:close()
end

function PopupAwakePreview:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._previewData[index]
	if data then
		item:update(data)
	end
end

function PopupAwakePreview:_onItemSelected(item, index)
	
end

function PopupAwakePreview:_onItemTouch(index, t)
	
end

return PopupAwakePreview