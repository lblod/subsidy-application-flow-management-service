import { CONSUMPTION_STATUS } from '../../lib/constants';
import Resource from './resource';

class Consumption extends Resource {
  constructor({uri, id, status, follows, active}) {
    super(uri, id);
    /**
     * {@link Consumption.STATUS}
     */
    this.status = status;
    /**
     * The URI of the SubsidyApplicationFlow the {@link Consumption} is following
     */
    this.follows = follows;
    /**
     * The URI of the active {@link ApplicationStep}
     */
    this.active = active;
  }
}

Consumption.STATUS = {
  SENT: 'http://lblod.data.gift/concepts/2ea29fbf-6d46-4f08-9343-879282a9f484',
  ACTIVE: 'http://lblod.data.gift/concepts/c849ca98-455d-4f31-9e95-a3d9d06e4497',
  CONCEPT: 'http://lblod.data.gift/concepts/6373b454-22b6-4b65-b98f-3d86541f2fcf'
};

export default Consumption;