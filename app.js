import { app, errorHandler } from 'mu';
import { SERVICE_NAME } from './lib/env';
import { SEMANTIC_FORM_STATUS } from './lib/constants';
import {
  getSubsidyMeasureConsumption,
  activeFormHasStatus,
  getCurrentStep,
  getNextStep,
  updateActiveStep,
  generateNotification
} from './lib/queries';

app.get('/', function(req, res) {
  const message = `Hey there, you have reached ${SERVICE_NAME}! Seems like I'm doing just fine :)`;
  res.send(message);
});

app.patch('/flow/next-step/:uuid', async function(req, res, next) {
  try {
    const uuid = req.params.uuid;
    const subsidyMeasureConsumption = await getSubsidyMeasureConsumption(uuid);

    if (subsidyMeasureConsumption) {
      const currentStep = await getCurrentStep(subsidyMeasureConsumption);
      if (currentStep) {
        const activeFormIsSent = await activeFormHasStatus(subsidyMeasureConsumption, SEMANTIC_FORM_STATUS.SENT);
        if (activeFormIsSent) {
          const nextStep = await getNextStep(currentStep);
          await updateActiveStep(subsidyMeasureConsumption, nextStep);
          await generateNotification(subsidyMeasureConsumption, currentStep, nextStep);
          return res.status(204).send();
        } else {
          return res.status(403).send({ title: `Active form of ${subsidyMeasureConsumption} has not been submitted` });
        }
      } else {
        return res.status(200).send({ title: `No active step for subsidy measure consumption ${subsidyMeasureConsumption}` });
      }
    } else {
      return res.status(404).send({ title: `Subsidy measure consumption ${uuid} not found.` });
    }
  } catch (e) {
    console.log(`Something went wrong while moving to the next step of subsidy measure consumption ${uuid}`);
    console.log(e);
    return res.status(500).send({ title: `Something went wrong while moving to the next step of subsidy measure consumption ${uuid}` });
  }
});

app.use(errorHandler);
