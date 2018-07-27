"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LSP = require("vscode-languageserver-protocol");
const ordinal = require("./ordinal");
var Completion;
(function (Completion) {
    let Kind;
    (function (Kind) {
        function intoCode(kind) {
            switch (kind) {
                case "#":
                    return LSP.CompletionItemKind.Method;
                case "Class":
                    return LSP.CompletionItemKind.Class;
                case "Constructor":
                    return LSP.CompletionItemKind.Constructor;
                case "Exn":
                    return LSP.CompletionItemKind.Constructor;
                case "Label":
                    return LSP.CompletionItemKind.Field;
                case "Method":
                    return LSP.CompletionItemKind.Function;
                case "Module":
                    return LSP.CompletionItemKind.Module;
                case "Signature":
                    return LSP.CompletionItemKind.Interface;
                case "Type":
                    return LSP.CompletionItemKind.Class;
                case "Value":
                    return LSP.CompletionItemKind.Value;
                case "Variant":
                    return LSP.CompletionItemKind.Enum;
            }
        }
        Kind.intoCode = intoCode;
    })(Kind = Completion.Kind || (Completion.Kind = {}));
    function intoCode({ name: label, kind, desc: detail, info: documentation }) {
        return {
            data: {
                documentation,
            },
            detail,
            kind: Kind.intoCode(kind),
            label,
        };
    }
    Completion.intoCode = intoCode;
})(Completion = exports.Completion || (exports.Completion = {}));
var IErrorReport;
(function (IErrorReport) {
    let Type;
    (function (Type) {
        function intoCode(type) {
            switch (type) {
                case "env":
                    return LSP.DiagnosticSeverity.Error;
                case "error":
                    return LSP.DiagnosticSeverity.Error;
                case "parser":
                    return LSP.DiagnosticSeverity.Error;
                case "type":
                    return LSP.DiagnosticSeverity.Error;
                case "unknown":
                    return LSP.DiagnosticSeverity.Error;
                case "warning":
                    return LSP.DiagnosticSeverity.Warning;
            }
        }
        Type.intoCode = intoCode;
    })(Type = IErrorReport.Type || (IErrorReport.Type = {}));
    function improveMessage(session, { uri }, original) {
        return __awaiter(this, void 0, void 0, function* () {
            if (original === "Invalid statement") {
                const document = session.synchronizer.getText(uri);
                if (document && document.getText() === "=") {
                    return "Functions must be defined with => instead of the = symbol.";
                }
            }
            if (original === "Statement has to end with a semicolon") {
                return "Statements must be terminated with a semicolon.";
            }
            return original;
        });
    }
    function getCode(message) {
        const codeMatch = /^Warning\s*(\d+)?:/.exec(message);
        return codeMatch && codeMatch.length > 1 ? codeMatch[1] : "";
    }
    function intoCode(session, { uri }, { end, message: original, start, type }) {
        return __awaiter(this, void 0, void 0, function* () {
            const range = {
                end: ordinal.Position.intoCode(end),
                start: ordinal.Position.intoCode(start),
            };
            const location = { range, uri };
            const message = yield improveMessage(session, location, original);
            const code = getCode(original);
            const severity = Type.intoCode(type);
            const source = "merlin";
            return LSP.Diagnostic.create(range, message, severity, code, source);
        });
    }
    IErrorReport.intoCode = intoCode;
})(IErrorReport = exports.IErrorReport || (exports.IErrorReport = {}));
var Outline;
(function (Outline) {
    let Kind;
    (function (Kind) {
        function intoCode(kind) {
            switch (kind) {
                case "Class":
                    return LSP.SymbolKind.Class;
                case "Constructor":
                    return LSP.SymbolKind.Constructor;
                case "Exn":
                    return LSP.SymbolKind.Constructor;
                case "Label":
                    return LSP.SymbolKind.Field;
                case "Method":
                    return LSP.SymbolKind.Method;
                case "Modtype":
                    return LSP.SymbolKind.Interface;
                case "Module":
                    return LSP.SymbolKind.Module;
                case "Signature":
                    return LSP.SymbolKind.Interface;
                case "Type":
                    return LSP.SymbolKind.Class;
                case "Value":
                    return LSP.SymbolKind.Variable;
            }
        }
        Kind.intoCode = intoCode;
    })(Kind = Outline.Kind || (Outline.Kind = {}));
    function intoCode(outline, id) {
        const symbols = [];
        function traverse(children, scope) {
            for (const item of children) {
                if (item) {
                    const kind = Kind.intoCode(item.kind);
                    const range = {
                        end: ordinal.Position.intoCode(item.end),
                        start: ordinal.Position.intoCode(item.start),
                    };
                    const thisParent = scope === "" ? undefined : scope;
                    const nextParent = `${scope}${scope === "" ? "" : "."}${item.name}`;
                    const info = LSP.SymbolInformation.create(item.name, kind, range, id.uri, thisParent);
                    symbols.push(info);
                    traverse(item.children, nextParent);
                }
            }
        }
        traverse(outline, "");
        return symbols;
    }
    Outline.intoCode = intoCode;
})(Outline = exports.Outline || (exports.Outline = {}));
var TailPosition;
(function (TailPosition) {
    function intoCode(info) {
        const language = "reason.hover.info";
        const position = (arg) => ({ language, value: `position: ${arg}` });
        switch (info) {
            case "call":
                return position("tail (call)");
            case "no":
                return position("normal");
            case "position":
                return position("tail");
        }
    }
    TailPosition.intoCode = intoCode;
})(TailPosition = exports.TailPosition || (exports.TailPosition = {}));
//# sourceMappingURL=data.js.map