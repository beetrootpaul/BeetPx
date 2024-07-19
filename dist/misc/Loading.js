import { HtmlTemplate } from "../HtmlTemplate";
import { throwError } from "../helpers/throwError";
import { wait } from "../helpers/wait";
export class Loading {
    #minWaitToAvoidFlicker = wait(750);
    #startButton;
    #startClicked;
    constructor(params) {
        this.#startButton =
            document.querySelector(HtmlTemplate.selectors.startButton) ??
                throwError(`Unable to find a start button under a selector "${HtmlTemplate.selectors.startButton}"`);
        this.#startClicked = new Promise(resolve => {
            this.#startButton.addEventListener("click", () => {
                params.onStartClicked();
                resolve();
            });
        });
    }
    async showStartScreen() {
        await this.#minWaitToAvoidFlicker;
        HtmlTemplate.addLoadedClass();
        this.#startButton.focus();
        await this.#startClicked;
        HtmlTemplate.addStartedClass();
    }
}
