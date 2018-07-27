"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Query {
    constructor(query) {
        this.query = query;
    }
}
exports.Query = Query;
(function (Query) {
    let kase;
    (function (kase) {
        kase.analysis = {
            from: (start) => ({
                to: (end) => new Query([
                    "case",
                    "analysis",
                    "from",
                    start,
                    "to",
                    end,
                ]),
            }),
        };
    })(kase = Query.kase || (Query.kase = {}));
    let complete;
    (function (complete) {
        complete.prefix = (text) => ({
            at: (position) => ({
                with: {
                    doc: () => new Query(["complete", "prefix", text, "at", position, "with", "doc"]),
                },
            }),
        });
    })(complete = Query.complete || (Query.complete = {}));
    Query.document = (name) => ({
        at: (position) => new Query(["document", name, "at", position]),
    });
    let dump;
    (function (dump) {
        let env;
        (function (env) {
            env.at = (position) => new Query(["dump", "env", "at", position]);
        })(env = dump.env || (dump.env = {}));
    })(dump = Query.dump || (Query.dump = {}));
    Query.enclosing = (position) => new Query(["enclosing", position]);
    Query.errors = () => new Query(["errors"]);
    Query.locate = (name, kind) => ({
        at: (position) => new Query([
            "locate",
            name,
            kind,
            "at",
            position,
        ]),
    });
    let occurrences;
    (function (occurrences) {
        let ident;
        (function (ident) {
            ident.at = (position) => new Query(["occurrences", "ident", "at", position]);
        })(ident = occurrences.ident || (occurrences.ident = {}));
    })(occurrences = Query.occurrences || (Query.occurrences = {}));
    Query.outline = () => new Query(["outline"]);
    let path;
    (function (path) {
        let list;
        (function (list) {
            list.source = () => new Query(["path", "list", "source"]);
        })(list = path.list || (path.list = {}));
    })(path = Query.path || (Query.path = {}));
    let project;
    (function (project) {
        project.get = () => new Query(["project", "get"]);
    })(project = Query.project || (Query.project = {}));
    let type;
    (function (type) {
        type.expression = (expr) => ({
            at: (position) => new Query(["type", "expression", expr, "at", position]),
        });
        let enclosing;
        (function (enclosing) {
            enclosing.at = (position) => new Query(["type", "enclosing", "at", position]);
        })(enclosing = type.enclosing || (type.enclosing = {}));
    })(type = Query.type || (Query.type = {}));
})(Query = exports.Query || (exports.Query = {}));
//# sourceMappingURL=query.js.map