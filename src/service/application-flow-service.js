import ApplicationForm from '../model/application-form';
import Consumption from '../model/consumption';
import { ApplicationFormRepository } from '../repository/application-form-repository';
import ConsumptionRepository from '../repository/consumption-repository';

class ApplicationFlowService {

  /**
   *  Will open/revert back to the given {@link ApplicationStep} on the given {@link Consumption}.
   *
   * @param consumption The {@link Consumption} where we want to (re)open a step.
   * @param step The {@link ApplicationStep} we want to be (re)opened.
   *
   * @returns {Promise<Consumption>}
   */
  static openStep = async function(consumption, step) {
    if (!consumption)
      throw 'consumption can not be falsy';
    if (!step)
      throw 'step can not be falsy';

    const forms = await ApplicationFormRepository.findAllByConsumptionURI(consumption.uri);
    if (forms)
      await Promise.all([].concat(forms).map(async (form) => {
        if (form.order >= step.order) {
          form.status = ApplicationForm.STATUS.CONCEPT;
        } else {
          form.status = ApplicationForm.STATUS.SENT;
        }
        await ApplicationFormRepository.update(form);
      }));

    consumption.active = step.uri;

    if (step.isFirst()) {
      consumption.status = Consumption.STATUS.CONCEPT;
    } else {
      consumption.status = Consumption.STATUS.ACTIVE;
    }

    await ConsumptionRepository.update(consumption);

    return consumption;
  };

}

export default ApplicationFlowService;