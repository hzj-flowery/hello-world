import { Texture } from "./Texture"
import { TextureAtlasPage } from "./TextureAtlasPage"
import { TextureAtlasRegion } from "./TextureAtlasRegion"
export class TextureAtlas{
public pages:Array<any>;
public regions:Array<any>;

        constructor(atlasText, textureLoader){
            this.pages = new Array();
            this.regions = new Array();
            this.load(atlasText, textureLoader);
        }
        public load(atlasText, textureLoader) {
            if (textureLoader == null)
                throw new Error("textureLoader cannot be null.");
            var reader = new TextureAtlasReader(atlasText);
            var tuple = new Array(4);
            var page = null;
            while (true) {
                var line = reader.readLine();
                if (line == null)
                    break;
                line = line.trim();
                if (line.length == 0)
                    page = null;
                else if (!page) {
                    page = new TextureAtlasPage();
                    page.name = line;
                    if (reader.readTuple(tuple) == 2) {
                        page.width = parseInt(tuple[0]);
                        page.height = parseInt(tuple[1]);
                        reader.readTuple(tuple);
                    }
                    reader.readTuple(tuple);
                    page.minFilter = Texture.filterFromString(tuple[0]);
                    page.magFilter = Texture.filterFromString(tuple[1]);
                    var direction = reader.readValue();
                    page.uWrap = TextureWrap.ClampToEdge;
                    page.vWrap = TextureWrap.ClampToEdge;
                    if (direction == "x")
                        page.uWrap = TextureWrap.Repeat;
                    else if (direction == "y")
                        page.vWrap = TextureWrap.Repeat;
                    else if (direction == "xy")
                        page.uWrap = page.vWrap = TextureWrap.Repeat;
                    page.texture = textureLoader(line);
                    page.texture.setFilters(page.minFilter, page.magFilter);
                    page.texture.setWraps(page.uWrap, page.vWrap);
                    page.width = page.texture.getImage().width;
                    page.height = page.texture.getImage().height;
                    this.pages.push(page);
                }
                else {
                    var region = new TextureAtlasRegion();
                    region.name = line;
                    region.page = page;
                    var rotateValue = reader.readValue();
                    if (rotateValue.toLocaleLowerCase() == "true") {
                        region.degrees = 90;
                    }
                    else if (rotateValue.toLocaleLowerCase() == "false") {
                        region.degrees = 0;
                    }
                    else {
                        region.degrees = parseFloat(rotateValue);
                    }
                    region.rotate = region.degrees == 90;
                    reader.readTuple(tuple);
                    var x = parseInt(tuple[0]);
                    var y = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    var width = parseInt(tuple[0]);
                    var height = parseInt(tuple[1]);
                    region.u = x / page.width;
                    region.v = y / page.height;
                    if (region.rotate) {
                        region.u2 = (x + height) / page.width;
                        region.v2 = (y + width) / page.height;
                    }
                    else {
                        region.u2 = (x + width) / page.width;
                        region.v2 = (y + height) / page.height;
                    }
                    region.x = x;
                    region.y = y;
                    region.width = Math.abs(width);
                    region.height = Math.abs(height);
                    if (reader.readTuple(tuple) == 4) {
                        if (reader.readTuple(tuple) == 4) {
                            reader.readTuple(tuple);
                        }
                    }
                    region.originalWidth = parseInt(tuple[0]);
                    region.originalHeight = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    region.offsetX = parseInt(tuple[0]);
                    region.offsetY = parseInt(tuple[1]);
                    region.index = parseInt(reader.readValue());
                    region.texture = page.texture;
                    this.regions.push(region);
                }
            }
        };
        public findRegion(name) {
            for (var i = 0; i < this.regions.length; i++) {
                if (this.regions[i].name == name) {
                    return this.regions[i];
                }
            }
            return null;
        };
        public dispose() {
            for (var i = 0; i < this.pages.length; i++) {
                this.pages[i].texture.dispose();
            }
        };
       
    }
