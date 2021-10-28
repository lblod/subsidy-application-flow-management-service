import Resource from './resource';

class ApplicationForm extends Resource {
  constructor({uri, id, status, order}) {
    super(uri, id);
    /**
     * {@link ApplicationForm.STATUS}
     */
    this.status = status;
    /**
     * Order of the {@link ApplicationStep} it is part of
     */
    this.order = order;
  }
}

ApplicationForm.STATUS = {
  SENT: 'http://lblod.data.gift/concepts/9bd8d86d-bb10-4456-a84e-91e9507c374c',
  CONCEPT: 'http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd'
};

export default ApplicationForm;