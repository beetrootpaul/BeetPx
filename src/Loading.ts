// TODO: add some loading animation

import { HtmlTemplate } from "./HtmlTemplate";

export class Loading {
  showApp(): void {
    HtmlTemplate.addLoadedClass();
  }
}
