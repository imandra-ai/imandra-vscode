import Session from "../session";
export default class Esy {
    private readonly session;
    constructor(session: Session);
    run(): Promise<string>;
}
