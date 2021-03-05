local PopupBase = require("app.ui.PopupBase")
local PopupReplays = class("PopupReplays", PopupBase)
local ReplayVSNode = require("app.scene.view.campRace.ReplayVSNode")

function PopupReplays:ctor(reports)
    self._reports = reports
    self._nodeReplays = {}
	local resource = {
		file = Path.getCSB("PopupReplays", "campRace"),
		binding = {
			-- _panelCamp1 = {
			-- 	events = {{event = "touch", method = "_onPanelCampClick"}}
			-- },
			-- _panelCamp2 = {
			-- 	events = {{event = "touch", method = "_onPanelCampClick"}}
			-- },
			-- _panelCamp3 = {
			-- 	events = {{event = "touch", method = "_onPanelCampClick"}}
			-- },
			-- _panelCamp4 = {
			-- 	events = {{event = "touch", method = "_onPanelCampClick"}}
			-- },
		}
	}
	PopupReplays.super.ctor(self, resource)
end

function PopupReplays:onCreate()
    self._popBG:addCloseEventListener(handler(self,self.closeWithAction))
    self._popBG:setTitle(Lang.get("camp_replay_title"))
    for i = 1, 3 do 
        local node = ReplayVSNode.new(self["_nodeVS"..i], self._reports[i], i)
        self._nodeReplays[i] = node
    end
end

function PopupReplays:onEnter()

end

function PopupReplays:onExit()

end

return PopupReplays

