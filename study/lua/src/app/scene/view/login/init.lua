local scene = {}

cc.register("SecretViewTabBtn", require("app.ui.component.CommonTabGroup"))

scene.frame = 30
scene.view = import(".LoginView")

return scene