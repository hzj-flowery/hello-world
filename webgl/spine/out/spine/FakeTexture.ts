export class FakeTexture extends Texture{

        
        function FakeTexture() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        public setFilters(minFilter, magFilter) { };
        public setWraps(uWrap, vWrap) { };
        public dispose() { };
        return FakeTexture;
    }