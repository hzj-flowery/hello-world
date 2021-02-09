
-- Author: conley
-- Date:2018-11-23 17:08:08
-- Rebuilt by Panhoa

local ViewBase = require("app.ui.ViewBase")
local HistoryHeroBookView = class("HistoryHeroBookView", ViewBase)
local HistoryHeroBookItemCell = require("app.scene.view.historyhero.HistoryHeroBookItemCell")


function HistoryHeroBookView:ctor()
	self._buttonActivate 	= nil
	self._listItemSource 	= nil
	self._nodeActivedEffect = nil
	self._curGalleryIndex	= 1	   -- Cur's Gallery-idx
	self._heroBook			= {}   -- 历代图鉴表
	self._activedBooks		= {}   -- 已经激活的
	
	local resource = {
		file = Path.getCSB("HistoryHeroBookView", "historyhero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonActivate = {
				events = {{event = "touch", method = "_onButtonActivate"}}
			},
		},
	}
	HistoryHeroBookView.super.ctor(self, resource)
end

function HistoryHeroBookView:onCreate()
	self._nodeActivedEffect:setScaleX(0.76)
	self:_initListItemSource()
end

function HistoryHeroBookView:onEnter()
	self._bookActived = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_ACTIVATE_BOOK_SUCCESS, handler(self, self._onBookActived)) 	-- 激活

	self._activedBooks = G_UserData:getHistoryHero():getActivatedBookIds()
	self._heroBook = G_UserData:getHistoryHero():getHeroBook()
	self:_updateStarListView()
	self:_updateBookView()
end

function HistoryHeroBookView:onExit()
	if self._bookActived then
		self._bookActived:remove()
		self._bookActived = nil
	end
end

-- @Role 	激活成功
function HistoryHeroBookView:_onBookActived(id, message)
	self:_updateBookView()
end

-- @Role 	点击激活
function HistoryHeroBookView:_onButtonActivate()
	for index = 1, #self._heroBook do
		if index == self._curGalleryIndex then
			G_UserData:getHistoryHero():c2sStarCollection(self._heroBook[index].id)
		end
	end
end

-- @Role 	Update Activebutton's state
function HistoryHeroBookView:_updateBookView()
	self._nodeActivedEffect:setVisible(false)
	self._buttonActivate:setString(Lang.get("hero_detail_btn_active"))
	if self._heroBook == nil or table.nums(self._heroBook) <= 0 then
		self._buttonActivate:setEnabled(false)
		return
	end

	for index = 1, #self._heroBook do
		if index == self._curGalleryIndex then
			if G_UserData:getHandBook():isHostoricalHeroHave(tonumber(self._heroBook[index].hero_1)) and 
			G_UserData:getHandBook():isHostoricalHeroHave(tonumber(self._heroBook[index].hero_2)) then
				if self._activedBooks == nil or table.nums(self._activedBooks) <= 0 then
					self._buttonActivate:setEnabled(true)
					self._nodeActivedEffect:setVisible(true)
					self._nodeActivedEffect:removeAllChildren()
					G_EffectGfxMgr:createPlayGfx(self._nodeActivedEffect, "effect_anniufaguang_big")
				else
					if G_UserData:getHistoryHero():isActivedBook(self._heroBook[index].id) then
						self._buttonActivate:setEnabled(false)
						self._buttonActivate:setString(Lang.get("historyhero_actived"))
					else
						self._buttonActivate:setEnabled(true)
						self._nodeActivedEffect:setVisible(true)
						self._nodeActivedEffect:removeAllChildren()
						G_EffectGfxMgr:createPlayGfx(self._nodeActivedEffect, "effect_anniufaguang_big")
					end	
				end
			else
				self._buttonActivate:setEnabled(false)
			end
		end
	end
	
end

function HistoryHeroBookView:_initListItemSource()
	cc.bind(self._listItemSource,"CommonGalleryView")
	self._listItemSource:setTemplate(HistoryHeroBookItemCell)
	self._listItemSource:setCallback(handler(self, self._onListItemSourceItemUpdate), handler(self, self._onListItemSourceItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onListItemSourceItemTouch))
	self._listItemSource:setCurgalleryCallback(handler(self, self._onChangeItemGallery))
end

------------------------------------------------------------------------------
function HistoryHeroBookView:_onListItemSourceItemUpdate(item, index)
	if self._heroBook == nil or table.nums(self._heroBook) <= 0 then
		return
	end

	local curIndex = (index + 1)
	if rawget(self._heroBook, curIndex) == nil then
		return
	end

	local data = {}
	data = self._heroBook[curIndex]
	data.index = curIndex
	data.isCurGallery = (self._curGalleryIndex == curIndex)
	item:updateUI(data)
end

function HistoryHeroBookView:_onListItemSourceItemSelected(item, index)
end

function HistoryHeroBookView:_onListItemSourceItemTouch(index, params)
end

function HistoryHeroBookView:_onChangeItemGallery(index)	
	if index == nil or self._curGalleryIndex == index then
		return
	end

	self._curGalleryIndex = index
	self:_updateBookView()

	for index = 1, table.nums(self._heroBook) do
		local tag = (index - 1)
		local item = self._listItemSource:getItemByTag(tag)
		if item ~= nil then
			item:updateItemAttrs(index == self._curGalleryIndex)
		end
	end
end

function HistoryHeroBookView:_updateStarListView()
	if self._heroBook == nil or table.nums(self._heroBook) <= 0 then
		return
	end	
	self._listItemSource:clearAll()
	self._listItemSource:resize(table.nums(self._heroBook))
end
--------------------------------------------------------------------------------


return HistoryHeroBookView