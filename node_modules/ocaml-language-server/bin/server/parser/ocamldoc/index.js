"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser = require("./grammar");
exports.ignore = new RegExp([
    /^Needed cmti file of module/,
    /^No documentation available/,
    /^Not a valid identifier/,
    /^Not in environment '.*'/,
    /^The initially opened module\.$/,
    /^didn't manage to find/,
]
    .map(rx => rx.source)
    .join("|"));
function intoMarkdown(ocamldoc) {
    let result = ocamldoc;
    try {
        result = parser.parse(ocamldoc);
    }
    catch (err) {
    }
    return result;
}
exports.intoMarkdown = intoMarkdown;
//# sourceMappingURL=index.js.map