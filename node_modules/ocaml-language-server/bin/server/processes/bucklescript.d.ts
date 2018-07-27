import Session from "../session";
export default class BuckleScript {
    private readonly session;
    constructor(session: Session);
    run(): Promise<string>;
}
