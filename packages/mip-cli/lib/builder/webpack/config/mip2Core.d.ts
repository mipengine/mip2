declare const MIP: {
  version: string,
  CustomElement: CustomElement,
}

declare class CustomElement {
  element: HTMLElement;
  observedAttributes: () => string[];
  constructor (element: HTMLElement);
  connectedCallback: () => void;
  disconnectedCallback: () => void;
  firstInviewCallback: () => void;
  attributeChangedCallback: () => void;
  viewportCallback: () => void;
  build(): void;
  prerenderAllowed: () => boolean;
  hasResources: () => boolean;
  addEventAction: (name: string, handler: (event: object, args: string) => void) => void;
  executeEventAction: (handler: (event: object, args: string) => void) => void
}