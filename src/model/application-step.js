import Resource from './resource';

class ApplicationStep extends Resource {
  constructor({uri, id, previous, order}) {
    super(uri, id);
    /**
     * The URI of the previous {@link ApplicationStep}
     */
    this.previous = previous;
    /**
     * Order
     */
    this.order = order;
  }

  isFirst() {
    return this.order === 0;
  }
}

export default ApplicationStep;