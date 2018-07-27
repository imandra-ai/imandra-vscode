"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Position;
(function (Position) {
    function fromCode({ character: col, line }) {
        return { col, line: line + 1 };
    }
    Position.fromCode = fromCode;
    function intoCode({ col: character, line }) {
        return { character, line: line - 1 };
    }
    Position.intoCode = intoCode;
})(Position = exports.Position || (exports.Position = {}));
var Location;
(function (Location) {
    function fromCode(range) {
        const start = Position.fromCode(range.start);
        const end = Position.fromCode(range.end);
        return { start, end };
    }
    Location.fromCode = fromCode;
    function intoCode(location) {
        const start = Position.intoCode(location.start);
        const end = Position.intoCode(location.end);
        return { start, end };
    }
    Location.intoCode = intoCode;
})(Location = exports.Location || (exports.Location = {}));
//# sourceMappingURL=ordinal.js.map