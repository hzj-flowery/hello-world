// Spine runtime version 3.8
var spine;
(function (spine) {
    export class Animation {

    }
    var MixBlend;
    (function (MixBlend) {
    })(MixBlend = spine.MixBlend || (spine.MixBlend = {}));
    var MixDirection;
    (function (MixDirection) {
    })(MixDirection = spine.MixDirection || (spine.MixDirection = {}));
    var TimelineType;
    (function (TimelineType) {
    })(TimelineType = spine.TimelineType || (spine.TimelineType = {}));
    export class CurveTimeline {
    }
    spine.CurveTimeline = CurveTimeline;
    export class RotateTimeline extends CurveTimeline { };
    spine.RotateTimeline = RotateTimeline;
    export class TranslateTimeline extends CurveTimeline { };
    spine.TranslateTimeline = TranslateTimeline;
    export class ScaleTimeline extends TranslateTimeline { };
    spine.ScaleTimeline = ScaleTimeline;
    export class ShearTimeline extends TranslateTimeline { };
    spine.ShearTimeline = ShearTimeline;
    export class ColorTimeline extends CurveTimeline { };
    spine.ColorTimeline = ColorTimeline;
    export class TwoColorTimeline extends CurveTimeline { };
    spine.TwoColorTimeline = TwoColorTimeline;
    export class AttachmentTimeline {
    }
    spine.AttachmentTimeline = AttachmentTimeline;
    var zeros = null;
    export class DeformTimeline extends CurveTimeline {
    }
    spine.DeformTimeline = DeformTimeline;
    export class EventTimeline {

    }
    spine.EventTimeline = EventTimeline;
    export class DrawOrderTimeline {

    }
    spine.DrawOrderTimeline = DrawOrderTimeline;

    spine.IkConstraintTimeline = IkConstraintTimeline;
    export class TransformConstraintTimeline extends CurveTimeline {


    }
    spine.TransformConstraintTimeline = TransformConstraintTimeline;
    
    spine.PathConstraintPositionTimeline = PathConstraintPositionTimeline;

spine.PathConstraintSpacingTimeline = PathConstraintSpacingTimeline;

spine.PathConstraintMixTimeline = PathConstraintMixTimeline;
}) (spine || (spine = {}));

var spine;
(function (spine) {
    
spine.AnimationState = AnimationState;

spine.TrackEntry = TrackEntry;

spine.EventQueue = EventQueue;
var EventType;
(function (EventType) {
    
})(EventType = spine.EventType || (spine.EventType = {}));

spine.AnimationStateAdapter = AnimationStateAdapter;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    
spine.AnimationStateData = AnimationStateData;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    
spine.AssetManager = AssetManager;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.AtlasAttachmentLoader = AtlasAttachmentLoader;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    var BlendMode;
    (function (BlendMode) {
       
    })(BlendMode = spine.BlendMode || (spine.BlendMode = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
   
spine.Bone = Bone;
}) (spine || (spine = {}));
var spine;
(function (spine) {
  
spine.BoneData = BoneData;
var TransformMode;
(function (TransformMode) {
    
})(TransformMode = spine.TransformMode || (spine.TransformMode = {}));
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.ConstraintData = ConstraintData;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.Event = Event;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    
spine.EventData = EventData;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    
spine.IkConstraint = IkConstraint;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
    spine.IkConstraintData = IkConstraintData;
}) (spine || (spine = {}));
var spine;
(function (spine) {
  
spine.PathConstraint = PathConstraint;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
    spine.PathConstraintData = PathConstraintData;
var PositionMode;
(function (PositionMode) {
    PositionMode[PositionMode["Fixed"] = 0] = "Fixed";
    PositionMode[PositionMode["Percent"] = 1] = "Percent";
})(PositionMode = spine.PositionMode || (spine.PositionMode = {}));
var SpacingMode;
(function (SpacingMode) {
    SpacingMode[SpacingMode["Length"] = 0] = "Length";
    SpacingMode[SpacingMode["Fixed"] = 1] = "Fixed";
    SpacingMode[SpacingMode["Percent"] = 2] = "Percent";
})(SpacingMode = spine.SpacingMode || (spine.SpacingMode = {}));
var RotateMode;
(function (RotateMode) {
    RotateMode[RotateMode["Tangent"] = 0] = "Tangent";
    RotateMode[RotateMode["Chain"] = 1] = "Chain";
    RotateMode[RotateMode["ChainScale"] = 2] = "ChainScale";
})(RotateMode = spine.RotateMode || (spine.RotateMode = {}));
}) (spine || (spine = {}));
var spine;
(function (spine) {
   

spine.SharedAssetManager = SharedAssetManager;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.Skeleton = Skeleton;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    
spine.SkeletonBinary = SkeletonBinary;

export class LinkedMesh   {
 constructor(mesh, skin, slotIndex, parent, inheritDeform) {
            this.mesh = mesh;
this.skin = skin;
this.slotIndex = slotIndex;
this.parent = parent;
this.inheritDeform = inheritDeform;
        }
return LinkedMesh;
    }
export class Vertices   {
 constructor(bones, vertices) {
    if(bones === void 0) { bones = null; }
if (vertices === void 0) { vertices = null; }
this.bones = bones;
this.vertices = vertices;
        }
return Vertices;
    }
}) (spine || (spine = {}));
var spine;
(function (spine) {

spine.SkeletonBounds = SkeletonBounds;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.SkeletonClipping = SkeletonClipping;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.SkeletonData = SkeletonData;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    
spine.SkeletonJson = SkeletonJson;
export class LinkedMesh   {
 constructor(mesh, skin, slotIndex, parent, inheritDeform) {
            this.mesh = mesh;
this.skin = skin;
this.slotIndex = slotIndex;
this.parent = parent;
this.inheritDeform = inheritDeform;
        }
return LinkedMesh;
    }
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class SkinEntry   {
 constructor(slotIndex, name, attachment) {
            this.slotIndex = slotIndex;
    this.name = name;
    this.attachment = attachment;
}
        return SkinEntry;
    }
spine.SkinEntry = SkinEntry;

spine.Skin = Skin;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.Slot = Slot;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.SlotData = SlotData;
}) (spine || (spine = {}));
var spine;
(function (spine) {
  
spine.Texture = Texture;
var TextureFilter;
(function (TextureFilter) {
})(TextureFilter = spine.TextureFilter || (spine.TextureFilter = {}));
var TextureWrap;
(function (TextureWrap) {

})(TextureWrap = spine.TextureWrap || (spine.TextureWrap = {}));

spine.TextureRegion = TextureRegion;
export class FakeTexture extends Texture {
        
        function FakeTexture() {
    return _super !== null && _super.apply(this, arguments) || this;
}
public setFilters(minFilter, magFilter) { };
public setWraps(uWrap, vWrap) { };
public dispose() { };
return FakeTexture;
    }
spine.FakeTexture = FakeTexture;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class TextureAtlas   {
 constructor(atlasText, textureLoader) {
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
            page.minFilter = spine.Texture.filterFromString(tuple[0]);
            page.magFilter = spine.Texture.filterFromString(tuple[1]);
            var direction = reader.readValue();
            page.uWrap = spine.TextureWrap.ClampToEdge;
            page.vWrap = spine.TextureWrap.ClampToEdge;
            if (direction == "x")
                page.uWrap = spine.TextureWrap.Repeat;
            else if (direction == "y")
                page.vWrap = spine.TextureWrap.Repeat;
            else if (direction == "xy")
                page.uWrap = page.vWrap = spine.TextureWrap.Repeat;
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
return TextureAtlas;
    }
spine.TextureAtlas = TextureAtlas;
export class TextureAtlasReader   {
 constructor(text) {
            this.index = 0;
this.lines = text.split(/\r\n|\r|\n/);
        }
public readLine() {
    if (this.index >= this.lines.length)
        return null;
    return this.lines[this.index++];
};
public readValue() {
    var line = this.readLine();
    var colon = line.indexOf(":");
    if (colon == -1)
        throw new Error("Invalid line: " + line);
    return line.substring(colon + 1).trim();
};
public readTuple(tuple) {
    var line = this.readLine();
    var colon = line.indexOf(":");
    if (colon == -1)
        throw new Error("Invalid line: " + line);
    var i = 0, lastMatch = colon + 1;
    for (; i < 3; i++) {
        var comma = line.indexOf(",", lastMatch);
        if (comma == -1)
            break;
        tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
        lastMatch = comma + 1;
    }
    tuple[i] = line.substring(lastMatch).trim();
    return i + 1;
};
return TextureAtlasReader;
    }
export class TextureAtlasPage   {
 constructor() {
}
return TextureAtlasPage;
    }
spine.TextureAtlasPage = TextureAtlasPage;
export class TextureAtlasRegion extends spine.TextureRegion {
        
        function TextureAtlasRegion() {
    return _super !== null && _super.apply(this, arguments) || this;
}
return TextureAtlasRegion;
    }
spine.TextureAtlasRegion = TextureAtlasRegion;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class TransformConstraint   {
 constructor(data, skeleton) {
            this.rotateMix = 0;
    this.translateMix = 0;
    this.scaleMix = 0;
    this.shearMix = 0;
    this.temp = new spine.Vector2();
    this.active = false;
    if (data == null)
        throw new Error("data cannot be null.");
    if (skeleton == null)
        throw new Error("skeleton cannot be null.");
    this.data = data;
    this.rotateMix = data.rotateMix;
    this.translateMix = data.translateMix;
    this.scaleMix = data.scaleMix;
    this.shearMix = data.shearMix;
    this.bones = new Array();
    for (var i = 0; i < data.bones.length; i++)
        this.bones.push(skeleton.findBone(data.bones[i].name));
    this.target = skeleton.findBone(data.target.name);
}
public isActive() {
    return this.active;
};
public apply() {
    this.update();
};
public update() {
    if (this.data.local) {
        if (this.data.relative)
            this.applyRelativeLocal();
        else
            this.applyAbsoluteLocal();
    }
    else {
        if (this.data.relative)
            this.applyRelativeWorld();
        else
            this.applyAbsoluteWorld();
    }
};
public applyAbsoluteWorld() {
    var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
    var target = this.target;
    var ta = target.a, tb = target.b, tc = target.c, td = target.d;
    var degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
    var offsetRotation = this.data.offsetRotation * degRadReflect;
    var offsetShearY = this.data.offsetShearY * degRadReflect;
    var bones = this.bones;
    for (var i = 0, n = bones.length; i < n; i++) {
        var bone = bones[i];
        var modified = false;
        if (rotateMix != 0) {
            var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            var r = Math.atan2(tc, ta) - Math.atan2(c, a) + offsetRotation;
            if (r > spine.MathUtils.PI)
                r -= spine.MathUtils.PI2;
            else if (r < -spine.MathUtils.PI)
                r += spine.MathUtils.PI2;
            r *= rotateMix;
            var cos = Math.cos(r), sin = Math.sin(r);
            bone.a = cos * a - sin * c;
            bone.b = cos * b - sin * d;
            bone.c = sin * a + cos * c;
            bone.d = sin * b + cos * d;
            modified = true;
        }
        if (translateMix != 0) {
            var temp = this.temp;
            target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
            bone.worldX += (temp.x - bone.worldX) * translateMix;
            bone.worldY += (temp.y - bone.worldY) * translateMix;
            modified = true;
        }
        if (scaleMix > 0) {
            var s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
            var ts = Math.sqrt(ta * ta + tc * tc);
            if (s > 0.00001)
                s = (s + (ts - s + this.data.offsetScaleX) * scaleMix) / s;
            bone.a *= s;
            bone.c *= s;
            s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
            ts = Math.sqrt(tb * tb + td * td);
            if (s > 0.00001)
                s = (s + (ts - s + this.data.offsetScaleY) * scaleMix) / s;
            bone.b *= s;
            bone.d *= s;
            modified = true;
        }
        if (shearMix > 0) {
            var b = bone.b, d = bone.d;
            var by = Math.atan2(d, b);
            var r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
            if (r > spine.MathUtils.PI)
                r -= spine.MathUtils.PI2;
            else if (r < -spine.MathUtils.PI)
                r += spine.MathUtils.PI2;
            r = by + (r + offsetShearY) * shearMix;
            var s = Math.sqrt(b * b + d * d);
            bone.b = Math.cos(r) * s;
            bone.d = Math.sin(r) * s;
            modified = true;
        }
        if (modified)
            bone.appliedValid = false;
    }
};
public applyRelativeWorld() {
    var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
    var target = this.target;
    var ta = target.a, tb = target.b, tc = target.c, td = target.d;
    var degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
    var offsetRotation = this.data.offsetRotation * degRadReflect, offsetShearY = this.data.offsetShearY * degRadReflect;
    var bones = this.bones;
    for (var i = 0, n = bones.length; i < n; i++) {
        var bone = bones[i];
        var modified = false;
        if (rotateMix != 0) {
            var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            var r = Math.atan2(tc, ta) + offsetRotation;
            if (r > spine.MathUtils.PI)
                r -= spine.MathUtils.PI2;
            else if (r < -spine.MathUtils.PI)
                r += spine.MathUtils.PI2;
            r *= rotateMix;
            var cos = Math.cos(r), sin = Math.sin(r);
            bone.a = cos * a - sin * c;
            bone.b = cos * b - sin * d;
            bone.c = sin * a + cos * c;
            bone.d = sin * b + cos * d;
            modified = true;
        }
        if (translateMix != 0) {
            var temp = this.temp;
            target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
            bone.worldX += temp.x * translateMix;
            bone.worldY += temp.y * translateMix;
            modified = true;
        }
        if (scaleMix > 0) {
            var s = (Math.sqrt(ta * ta + tc * tc) - 1 + this.data.offsetScaleX) * scaleMix + 1;
            bone.a *= s;
            bone.c *= s;
            s = (Math.sqrt(tb * tb + td * td) - 1 + this.data.offsetScaleY) * scaleMix + 1;
            bone.b *= s;
            bone.d *= s;
            modified = true;
        }
        if (shearMix > 0) {
            var r = Math.atan2(td, tb) - Math.atan2(tc, ta);
            if (r > spine.MathUtils.PI)
                r -= spine.MathUtils.PI2;
            else if (r < -spine.MathUtils.PI)
                r += spine.MathUtils.PI2;
            var b = bone.b, d = bone.d;
            r = Math.atan2(d, b) + (r - spine.MathUtils.PI / 2 + offsetShearY) * shearMix;
            var s = Math.sqrt(b * b + d * d);
            bone.b = Math.cos(r) * s;
            bone.d = Math.sin(r) * s;
            modified = true;
        }
        if (modified)
            bone.appliedValid = false;
    }
};
public applyAbsoluteLocal() {
    var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
    var target = this.target;
    if (!target.appliedValid)
        target.updateAppliedTransform();
    var bones = this.bones;
    for (var i = 0, n = bones.length; i < n; i++) {
        var bone = bones[i];
        if (!bone.appliedValid)
            bone.updateAppliedTransform();
        var rotation = bone.arotation;
        if (rotateMix != 0) {
            var r = target.arotation - rotation + this.data.offsetRotation;
            r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
            rotation += r * rotateMix;
        }
        var x = bone.ax, y = bone.ay;
        if (translateMix != 0) {
            x += (target.ax - x + this.data.offsetX) * translateMix;
            y += (target.ay - y + this.data.offsetY) * translateMix;
        }
        var scaleX = bone.ascaleX, scaleY = bone.ascaleY;
        if (scaleMix != 0) {
            if (scaleX > 0.00001)
                scaleX = (scaleX + (target.ascaleX - scaleX + this.data.offsetScaleX) * scaleMix) / scaleX;
            if (scaleY > 0.00001)
                scaleY = (scaleY + (target.ascaleY - scaleY + this.data.offsetScaleY) * scaleMix) / scaleY;
        }
        var shearY = bone.ashearY;
        if (shearMix != 0) {
            var r = target.ashearY - shearY + this.data.offsetShearY;
            r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
            bone.shearY += r * shearMix;
        }
        bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
    }
};
public applyRelativeLocal() {
    var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
    var target = this.target;
    if (!target.appliedValid)
        target.updateAppliedTransform();
    var bones = this.bones;
    for (var i = 0, n = bones.length; i < n; i++) {
        var bone = bones[i];
        if (!bone.appliedValid)
            bone.updateAppliedTransform();
        var rotation = bone.arotation;
        if (rotateMix != 0)
            rotation += (target.arotation + this.data.offsetRotation) * rotateMix;
        var x = bone.ax, y = bone.ay;
        if (translateMix != 0) {
            x += (target.ax + this.data.offsetX) * translateMix;
            y += (target.ay + this.data.offsetY) * translateMix;
        }
        var scaleX = bone.ascaleX, scaleY = bone.ascaleY;
        if (scaleMix != 0) {
            if (scaleX > 0.00001)
                scaleX *= ((target.ascaleX - 1 + this.data.offsetScaleX) * scaleMix) + 1;
            if (scaleY > 0.00001)
                scaleY *= ((target.ascaleY - 1 + this.data.offsetScaleY) * scaleMix) + 1;
        }
        var shearY = bone.ashearY;
        if (shearMix != 0)
            shearY += (target.ashearY + this.data.offsetShearY) * shearMix;
        bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
    }
};
return TransformConstraint;
    }
spine.TransformConstraint = TransformConstraint;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class TransformConstraintData extends spine.ConstraintData {
        
        function TransformConstraintData(name) {
super( name, 0, false);
        _this.bones = new Array();
        _this.rotateMix = 0;
        _this.translateMix = 0;
        _this.scaleMix = 0;
        _this.shearMix = 0;
        _this.offsetRotation = 0;
        _this.offsetX = 0;
        _this.offsetY = 0;
        _this.offsetScaleX = 0;
        _this.offsetScaleY = 0;
        _this.offsetShearY = 0;
        _this.relative = false;
        _this.local = false;
        return _this;
    }
    return TransformConstraintData;
}
    spine.TransformConstraintData = TransformConstraintData;
}) (spine || (spine = {}));
var spine;
(function (spine) {
   
spine.Triangulator = Triangulator;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    
spine.IntSet = IntSet;

spine.Color = Color;

spine.MathUtils = MathUtils;
spine.Interpolation = Interpolation;

spine.Pow = Pow;

spine.PowOut = PowOut;

spine.Utils = Utils;

spine.DebugUtils = DebugUtils;

spine.Pool = Pool;
export class Vector2   {
 constructor(x, y) {
    if(x === void 0) { x = 0; }
if (y === void 0) { y = 0; }
this.x = x;
this.y = y;
        }
public set(x, y) {
    this.x = x;
    this.y = y;
    return this;
};
public length() {
    var x = this.x;
    var y = this.y;
    return Math.sqrt(x * x + y * y);
};
public normalize() {
    var len = this.length();
    if (len != 0) {
        this.x /= len;
        this.y /= len;
    }
    return this;
};
return Vector2;
    }
spine.Vector2 = Vector2;
export class TimeKeeper   {
 constructor() {
            this.maxDelta = 0.064;
this.framesPerSecond = 0;
this.delta = 0;
this.totalTime = 0;
this.lastTime = Date.now() / 1000;
this.frameCount = 0;
this.frameTime = 0;
        }
public update() {
    var now = Date.now() / 1000;
    this.delta = now - this.lastTime;
    this.frameTime += this.delta;
    this.totalTime += this.delta;
    if (this.delta > this.maxDelta)
        this.delta = this.maxDelta;
    this.lastTime = now;
    this.frameCount++;
    if (this.frameTime > 1) {
        this.framesPerSecond = this.frameCount / this.frameTime;
        this.frameTime = 0;
        this.frameCount = 0;
    }
};
return TimeKeeper;
    }
spine.TimeKeeper = TimeKeeper;
export class WindowedMean   {
 constructor(windowSize) {
    if(windowSize === void 0) { windowSize = 32; }
this.addedValues = 0;
this.lastValue = 0;
this.mean = 0;
this.dirty = true;
this.values = new Array(windowSize);
        }
public hasEnoughData() {
    return this.addedValues >= this.values.length;
};
public addValue(value) {
    if (this.addedValues < this.values.length)
        this.addedValues++;
    this.values[this.lastValue++] = value;
    if (this.lastValue > this.values.length - 1)
        this.lastValue = 0;
    this.dirty = true;
};
public getMean() {
    if (this.hasEnoughData()) {
        if (this.dirty) {
            var mean = 0;
            for (var i = 0; i < this.values.length; i++) {
                mean += this.values[i];
            }
            this.mean = mean / this.values.length;
            this.dirty = false;
        }
        return this.mean;
    }
    else {
        return 0;
    }
};
return WindowedMean;
    }
spine.WindowedMean = WindowedMean;
}) (spine || (spine = {}));
(function () {
    if (!Math.fround) {
        Math.fround = (function (array) {
            return function (x) {
                return array[0] = x, array[0];
            };
        })(new Float32Array(1));
    }
})();
var spine;
(function (spine) {
    export class Attachment   {
 constructor(name) {
        if(name == null)
    throw new Error("name cannot be null.");
    this.name = name;
}
        return Attachment;
    }
spine.Attachment = Attachment;
export class VertexAttachment extends Attachment {
        
        function VertexAttachment(name) {
super( name);
    _this.id = (VertexAttachment.nextID++ & 65535) << 11;
    _this.worldVerticesLength = 0;
    _this.deformAttachment = _this;
    return _this;
}
public computeWorldVertices(slot, start, count, worldVertices, offset, stride) {
    count = offset + (count >> 1) * stride;
    var skeleton = slot.bone.skeleton;
    var deformArray = slot.deform;
    var vertices = this.vertices;
    var bones = this.bones;
    if (bones == null) {
        if (deformArray.length > 0)
            vertices = deformArray;
        var bone = slot.bone;
        var x = bone.worldX;
        var y = bone.worldY;
        var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
        for (var v_1 = start, w = offset; w < count; v_1 += 2, w += stride) {
            var vx = vertices[v_1], vy = vertices[v_1 + 1];
            worldVertices[w] = vx * a + vy * b + x;
            worldVertices[w + 1] = vx * c + vy * d + y;
        }
        return;
    }
    var v = 0, skip = 0;
    for (var i = 0; i < start; i += 2) {
        var n = bones[v];
        v += n + 1;
        skip += n;
    }
    var skeletonBones = skeleton.bones;
    if (deformArray.length == 0) {
        for (var w = offset, b = skip * 3; w < count; w += stride) {
            var wx = 0, wy = 0;
            var n = bones[v++];
            n += v;
            for (; v < n; v++, b += 3) {
                var bone = skeletonBones[bones[v]];
                var vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
                wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
            }
            worldVertices[w] = wx;
            worldVertices[w + 1] = wy;
        }
    }
    else {
        var deform = deformArray;
        for (var w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
            var wx = 0, wy = 0;
            var n = bones[v++];
            n += v;
            for (; v < n; v++, b += 3, f += 2) {
                var bone = skeletonBones[bones[v]];
                var vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
                wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
            }
            worldVertices[w] = wx;
            worldVertices[w + 1] = wy;
        }
    }
};
public copyTo(attachment) {
    if (this.bones != null) {
        attachment.bones = new Array(this.bones.length);
        spine.Utils.arrayCopy(this.bones, 0, attachment.bones, 0, this.bones.length);
    }
    else
        attachment.bones = null;
    if (this.vertices != null) {
        attachment.vertices = spine.Utils.newFloatArray(this.vertices.length);
        spine.Utils.arrayCopy(this.vertices, 0, attachment.vertices, 0, this.vertices.length);
    }
    else
        attachment.vertices = null;
    attachment.worldVerticesLength = this.worldVerticesLength;
    attachment.deformAttachment = this.deformAttachment;
};
VertexAttachment.nextID = 0;
return VertexAttachment;
    }
spine.VertexAttachment = VertexAttachment;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    var AttachmentType;
    (function (AttachmentType) {
        AttachmentType[AttachmentType["Region"] = 0] = "Region";
        AttachmentType[AttachmentType["BoundingBox"] = 1] = "BoundingBox";
        AttachmentType[AttachmentType["Mesh"] = 2] = "Mesh";
        AttachmentType[AttachmentType["LinkedMesh"] = 3] = "LinkedMesh";
        AttachmentType[AttachmentType["Path"] = 4] = "Path";
        AttachmentType[AttachmentType["Point"] = 5] = "Point";
        AttachmentType[AttachmentType["Clipping"] = 6] = "Clipping";
    })(AttachmentType = spine.AttachmentType || (spine.AttachmentType = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    export class BoundingBoxAttachment extends spine.VertexAttachment {
        
        function BoundingBoxAttachment(name) {
super( name);
        _this.color = new spine.Color(1, 1, 1, 1);
        return _this;
    }
public copy() {
        var copy = new BoundingBoxAttachment(name);
        this.copyTo(copy);
        copy.color.setFromColor(this.color);
        return copy;
    };
    return BoundingBoxAttachment;
}
    spine.BoundingBoxAttachment = BoundingBoxAttachment;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class ClippingAttachment extends spine.VertexAttachment {
        
        function ClippingAttachment(name) {
super( name);
        _this.color = new spine.Color(0.2275, 0.2275, 0.8078, 1);
        return _this;
    }
public copy() {
        var copy = new ClippingAttachment(name);
        this.copyTo(copy);
        copy.endSlot = this.endSlot;
        copy.color.setFromColor(this.color);
        return copy;
    };
    return ClippingAttachment;
}
    spine.ClippingAttachment = ClippingAttachment;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class MeshAttachment extends spine.VertexAttachment {
        
        function MeshAttachment(name) {
super( name);
        _this.color = new spine.Color(1, 1, 1, 1);
        _this.tempColor = new spine.Color(0, 0, 0, 0);
        return _this;
    }
public updateUVs() {
        var regionUVs = this.regionUVs;
        if (this.uvs == null || this.uvs.length != regionUVs.length)
            this.uvs = spine.Utils.newFloatArray(regionUVs.length);
        var uvs = this.uvs;
        var n = this.uvs.length;
        var u = this.region.u, v = this.region.v, width = 0, height = 0;
        if (this.region instanceof spine.TextureAtlasRegion) {
            var region = this.region;
            var textureWidth = region.texture.getImage().width, textureHeight = region.texture.getImage().height;
            switch (region.degrees) {
                case 90:
                    u -= (region.originalHeight - region.offsetY - region.height) / textureWidth;
                    v -= (region.originalWidth - region.offsetX - region.width) / textureHeight;
                    width = region.originalHeight / textureWidth;
                    height = region.originalWidth / textureHeight;
                    for (var i = 0; i < n; i += 2) {
                        uvs[i] = u + regionUVs[i + 1] * width;
                        uvs[i + 1] = v + (1 - regionUVs[i]) * height;
                    }
                    return;
                case 180:
                    u -= (region.originalWidth - region.offsetX - region.width) / textureWidth;
                    v -= region.offsetY / textureHeight;
                    width = region.originalWidth / textureWidth;
                    height = region.originalHeight / textureHeight;
                    for (var i = 0; i < n; i += 2) {
                        uvs[i] = u + (1 - regionUVs[i]) * width;
                        uvs[i + 1] = v + (1 - regionUVs[i + 1]) * height;
                    }
                    return;
                case 270:
                    u -= region.offsetY / textureWidth;
                    v -= region.offsetX / textureHeight;
                    width = region.originalHeight / textureWidth;
                    height = region.originalWidth / textureHeight;
                    for (var i = 0; i < n; i += 2) {
                        uvs[i] = u + (1 - regionUVs[i + 1]) * width;
                        uvs[i + 1] = v + regionUVs[i] * height;
                    }
                    return;
            }
            u -= region.offsetX / textureWidth;
            v -= (region.originalHeight - region.offsetY - region.height) / textureHeight;
            width = region.originalWidth / textureWidth;
            height = region.originalHeight / textureHeight;
        }
        else if (this.region == null) {
            u = v = 0;
            width = height = 1;
        }
        else {
            width = this.region.u2 - u;
            height = this.region.v2 - v;
        }
        for (var i = 0; i < n; i += 2) {
            uvs[i] = u + regionUVs[i] * width;
            uvs[i + 1] = v + regionUVs[i + 1] * height;
        }
    };
public getParentMesh() {
        return this.parentMesh;
    };
public setParentMesh(parentMesh) {
        this.parentMesh = parentMesh;
        if (parentMesh != null) {
            this.bones = parentMesh.bones;
            this.vertices = parentMesh.vertices;
            this.worldVerticesLength = parentMesh.worldVerticesLength;
            this.regionUVs = parentMesh.regionUVs;
            this.triangles = parentMesh.triangles;
            this.hullLength = parentMesh.hullLength;
            this.worldVerticesLength = parentMesh.worldVerticesLength;
        }
    };
public copy() {
        if (this.parentMesh != null)
            return this.newLinkedMesh();
        var copy = new MeshAttachment(this.name);
        copy.region = this.region;
        copy.path = this.path;
        copy.color.setFromColor(this.color);
        this.copyTo(copy);
        copy.regionUVs = new Array(this.regionUVs.length);
        spine.Utils.arrayCopy(this.regionUVs, 0, copy.regionUVs, 0, this.regionUVs.length);
        copy.uvs = new Array(this.uvs.length);
        spine.Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, this.uvs.length);
        copy.triangles = new Array(this.triangles.length);
        spine.Utils.arrayCopy(this.triangles, 0, copy.triangles, 0, this.triangles.length);
        copy.hullLength = this.hullLength;
        if (this.edges != null) {
            copy.edges = new Array(this.edges.length);
            spine.Utils.arrayCopy(this.edges, 0, copy.edges, 0, this.edges.length);
        }
        copy.width = this.width;
        copy.height = this.height;
        return copy;
    };
public newLinkedMesh() {
        var copy = new MeshAttachment(this.name);
        copy.region = this.region;
        copy.path = this.path;
        copy.color.setFromColor(this.color);
        copy.deformAttachment = this.deformAttachment;
        copy.setParentMesh(this.parentMesh != null ? this.parentMesh : this);
        copy.updateUVs();
        return copy;
    };
    return MeshAttachment;
}
    spine.MeshAttachment = MeshAttachment;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class PathAttachment extends spine.VertexAttachment {
        
        function PathAttachment(name) {
super( name);
        _this.closed = false;
        _this.constantSpeed = false;
        _this.color = new spine.Color(1, 1, 1, 1);
        return _this;
    }
public copy() {
        var copy = new PathAttachment(name);
        this.copyTo(copy);
        copy.lengths = new Array(this.lengths.length);
        spine.Utils.arrayCopy(this.lengths, 0, copy.lengths, 0, this.lengths.length);
        copy.closed = closed;
        copy.constantSpeed = this.constantSpeed;
        copy.color.setFromColor(this.color);
        return copy;
    };
    return PathAttachment;
}
    spine.PathAttachment = PathAttachment;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class PointAttachment extends spine.VertexAttachment {
        
        function PointAttachment(name) {
super( name);
        _this.color = new spine.Color(0.38, 0.94, 0, 1);
        return _this;
    }
public computeWorldPosition(bone, point) {
        point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
        point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
        return point;
    };
public computeWorldRotation(bone) {
        var cos = spine.MathUtils.cosDeg(this.rotation), sin = spine.MathUtils.sinDeg(this.rotation);
        var x = cos * bone.a + sin * bone.b;
        var y = cos * bone.c + sin * bone.d;
        return Math.atan2(y, x) * spine.MathUtils.radDeg;
    };
public copy() {
        var copy = new PointAttachment(name);
        copy.x = this.x;
        copy.y = this.y;
        copy.rotation = this.rotation;
        copy.color.setFromColor(this.color);
        return copy;
    };
    return PointAttachment;
}
    spine.PointAttachment = PointAttachment;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class RegionAttachment extends spine.Attachment {
        
        function RegionAttachment(name) {
super( name);
        _this.x = 0;
        _this.y = 0;
        _this.scaleX = 1;
        _this.scaleY = 1;
        _this.rotation = 0;
        _this.width = 0;
        _this.height = 0;
        _this.color = new spine.Color(1, 1, 1, 1);
        _this.offset = spine.Utils.newFloatArray(8);
        _this.uvs = spine.Utils.newFloatArray(8);
        _this.tempColor = new spine.Color(1, 1, 1, 1);
        return _this;
    }
public updateOffset() {
        var regionScaleX = this.width / this.region.originalWidth * this.scaleX;
        var regionScaleY = this.height / this.region.originalHeight * this.scaleY;
        var localX = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
        var localY = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
        var localX2 = localX + this.region.width * regionScaleX;
        var localY2 = localY + this.region.height * regionScaleY;
        var radians = this.rotation * Math.PI / 180;
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var localXCos = localX * cos + this.x;
        var localXSin = localX * sin;
        var localYCos = localY * cos + this.y;
        var localYSin = localY * sin;
        var localX2Cos = localX2 * cos + this.x;
        var localX2Sin = localX2 * sin;
        var localY2Cos = localY2 * cos + this.y;
        var localY2Sin = localY2 * sin;
        var offset = this.offset;
        offset[RegionAttachment.OX1] = localXCos - localYSin;
        offset[RegionAttachment.OY1] = localYCos + localXSin;
        offset[RegionAttachment.OX2] = localXCos - localY2Sin;
        offset[RegionAttachment.OY2] = localY2Cos + localXSin;
        offset[RegionAttachment.OX3] = localX2Cos - localY2Sin;
        offset[RegionAttachment.OY3] = localY2Cos + localX2Sin;
        offset[RegionAttachment.OX4] = localX2Cos - localYSin;
        offset[RegionAttachment.OY4] = localYCos + localX2Sin;
    };
public setRegion(region) {
        this.region = region;
        var uvs = this.uvs;
        if (region.rotate) {
            uvs[2] = region.u;
            uvs[3] = region.v2;
            uvs[4] = region.u;
            uvs[5] = region.v;
            uvs[6] = region.u2;
            uvs[7] = region.v;
            uvs[0] = region.u2;
            uvs[1] = region.v2;
        }
        else {
            uvs[0] = region.u;
            uvs[1] = region.v2;
            uvs[2] = region.u;
            uvs[3] = region.v;
            uvs[4] = region.u2;
            uvs[5] = region.v;
            uvs[6] = region.u2;
            uvs[7] = region.v2;
        }
    };
public computeWorldVertices(bone, worldVertices, offset, stride) {
        var vertexOffset = this.offset;
        var x = bone.worldX, y = bone.worldY;
        var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
        var offsetX = 0, offsetY = 0;
        offsetX = vertexOffset[RegionAttachment.OX1];
        offsetY = vertexOffset[RegionAttachment.OY1];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        offset += stride;
        offsetX = vertexOffset[RegionAttachment.OX2];
        offsetY = vertexOffset[RegionAttachment.OY2];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        offset += stride;
        offsetX = vertexOffset[RegionAttachment.OX3];
        offsetY = vertexOffset[RegionAttachment.OY3];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        offset += stride;
        offsetX = vertexOffset[RegionAttachment.OX4];
        offsetY = vertexOffset[RegionAttachment.OY4];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    };
public copy() {
        var copy = new RegionAttachment(name);
        copy.region = this.region;
        copy.rendererObject = this.rendererObject;
        copy.path = this.path;
        copy.x = this.x;
        copy.y = this.y;
        copy.scaleX = this.scaleX;
        copy.scaleY = this.scaleY;
        copy.rotation = this.rotation;
        copy.width = this.width;
        copy.height = this.height;
        spine.Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, 8);
        spine.Utils.arrayCopy(this.offset, 0, copy.offset, 0, 8);
        copy.color.setFromColor(this.color);
        return copy;
    };
static OX1  = 0;
static OY1  = 1;
static OX2  = 2;
static OY2  = 3;
static OX3  = 4;
static OY3  = 5;
static OX4  = 6;
static OY4  = 7;
static X1  = 0;
static Y1  = 1;
static C1R  = 2;
static C1G  = 3;
static C1B  = 4;
static C1A  = 5;
static U1  = 6;
static V1  = 7;
static X2  = 8;
static Y2  = 9;
static C2R  = 10;
static C2G  = 11;
static C2B  = 12;
static C2A  = 13;
static U2  = 14;
static V2  = 15;
static X3  = 16;
static Y3  = 17;
static C3R  = 18;
static C3G  = 19;
static C3B  = 20;
static C3A  = 21;
static U3  = 22;
static V3  = 23;
static X4  = 24;
static Y4  = 25;
static C4R  = 26;
static C4G  = 27;
static C4B  = 28;
static C4A  = 29;
static U4  = 30;
static V4  = 31;
    return RegionAttachment;
}
    spine.RegionAttachment = RegionAttachment;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class JitterEffect   {
 constructor(jitterX, jitterY) {
            this.jitterX = 0;
    this.jitterY = 0;
    this.jitterX = jitterX;
    this.jitterY = jitterY;
}
public begin(skeleton) {
};
public transform(position, uv, light, dark) {
    position.x += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
    position.y += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
};
public end() {
};
return JitterEffect;
    }
spine.JitterEffect = JitterEffect;
}) (spine || (spine = {}));
var spine;
(function (spine) {
    export class SwirlEffect   {
 constructor(radius, interpolation) {
            this.centerX = 0;
    this.centerY = 0;
    this.radius = 0;
    this.angle = 0;
    this.worldX = 0;
    this.worldY = 0;
    this.radius = radius;
    this.interpolation = interpolation;
}
public begin(skeleton) {
    this.worldX = skeleton.x + this.centerX;
    this.worldY = skeleton.y + this.centerY;
};
public transform(position, uv, light, dark) {
    var radAngle = this.angle * spine.MathUtils.degreesToRadians;
    var x = position.x - this.worldX;
    var y = position.y - this.worldY;
    var dist = Math.sqrt(x * x + y * y);
    if (dist < this.radius) {
        var theta = this.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        position.x = cos * x - sin * y + this.worldX;
        position.y = sin * x + cos * y + this.worldY;
    }
};
public end() {
};
SwirlEffect.interpolation = new spine.PowOut(2);
return SwirlEffect;
    }
spine.SwirlEffect = SwirlEffect;
}) (spine || (spine = {}));


