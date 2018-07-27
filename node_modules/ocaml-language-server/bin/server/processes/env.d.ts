/// <reference types="node" />
import { ChildProcess } from "child_process";
import Session from "../session";
export default class Env {
    readonly process: ChildProcess;
    constructor(session: Session);
}
