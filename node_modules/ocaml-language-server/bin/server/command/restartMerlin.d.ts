import * as lodash from "lodash";
import Session from "../session";
declare const restartMerlinDebounced: ((session: Session) => Promise<void>) & lodash.Cancelable;
export default restartMerlinDebounced;
