export class TextureAtlasReader{

        constructor(text){
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