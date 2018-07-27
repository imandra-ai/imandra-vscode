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
const lib_1 = require("../../../lib");
class Synchronizer {
    constructor(session) {
        this.session = session;
        this.documents = new Map();
    }
    dispose() {
        return;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    listen() {
        this.session.connection.onDidCloseTextDocument(this.onDidCloseTextDocument.bind(this));
        this.session.connection.onDidOpenTextDocument(this.onDidOpenTextDocument.bind(this));
        this.session.connection.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this));
        this.session.connection.onDidSaveTextDocument(this.onDidSaveTextDocument.bind(this));
    }
    onDidChangeConfiguration() {
        return;
    }
    getTextDocument(uri) {
        const document = this.documents.get(uri);
        return document ? document : null;
    }
    applyChangesToTextDocumentContent(oldDocument, change) {
        if (null == change.range)
            return null;
        const startOffset = oldDocument.offsetAt(change.range.start);
        const endOffset = oldDocument.offsetAt(change.range.end);
        const before = oldDocument.getText().substr(0, startOffset);
        const after = oldDocument.getText().substr(endOffset);
        return `${before}${change.text}${after}`;
    }
    doFullSync(document, languageId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            this.documents.set(document.uri, LSP.TextDocument.create(document.uri, languageId, document.version, content));
            const request = lib_1.merlin.Sync.tell("start", "end", content);
            yield this.session.merlin.sync(request, document);
        });
    }
    doIncrementalSync(oldDocument, newDocument, change) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null == change || null == change.range)
                return;
            const newContent = this.applyChangesToTextDocumentContent(oldDocument, change);
            if (null != newContent) {
                this.documents.set(newDocument.uri, LSP.TextDocument.create(oldDocument.uri, oldDocument.languageId, newDocument.version, newContent));
            }
            const startPos = lib_1.merlin.Position.fromCode(change.range.start);
            const endPos = lib_1.merlin.Position.fromCode(change.range.end);
            const request = lib_1.merlin.Sync.tell(startPos, endPos, change.text);
            yield this.session.merlin.sync(request, newDocument);
        });
    }
    onDidChangeTextDocument(event) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const change of event.contentChanges) {
                if (null == change)
                    continue;
                const oldDocument = this.documents.get(event.textDocument.uri);
                if (null == oldDocument)
                    continue;
                if (null == change.range) {
                    yield this.doFullSync(event.textDocument, oldDocument.languageId, change.text);
                }
                else {
                    yield this.doIncrementalSync(oldDocument, event.textDocument, change);
                }
                yield this.session.analyzer.refreshDebounced(event.textDocument);
            }
        });
    }
    onDidOpenTextDocument(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doFullSync(event.textDocument, event.textDocument.languageId, event.textDocument.text);
            yield this.session.analyzer.refreshImmediate(event.textDocument);
            yield this.session.indexer.refreshSymbols(event.textDocument);
        });
    }
    onDidCloseTextDocument(event) {
        this.documents.delete(event.textDocument.uri);
        this.session.analyzer.clear(event.textDocument);
    }
    onDidSaveTextDocument(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.session.analyzer.refreshImmediate(event.textDocument);
        });
    }
}
exports.default = Synchronizer;
//# sourceMappingURL=synchronizer.js.map