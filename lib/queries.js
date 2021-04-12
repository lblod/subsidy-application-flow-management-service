import { query, sparqlEscapeUri, sparqlEscapeString } from 'mu';
import { updateSudo as update} from '@lblod/mu-auth-sudo';
import { v4 as uuidv4 } from 'uuid';
import { NOTIFICATION_BASE_URL, NOTIFICATION_OPEN_STATUS, PUBLIC_GRAPH } from './constants';

/**
 * Returns a subsidy measure consumption for the given uuid.
 *
 * [CONSIDERED AUTH. SAFE]
 *
 * @param uuid
 *
 * @returns {Promise<string>}
 */
export async function getSubsidyMeasureConsumption(uuid) {
  const result = await query(`
    PREFIX subsidie: <http://data.vlaanderen.be/ns/subsidie#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT ?subsidyMeasureConsumption
    WHERE {
      GRAPH ?g {
        ?subsidyMeasureConsumption a subsidie:SubsidiemaatregelConsumptie ;
          mu:uuid ${sparqlEscapeString(uuid)} .
      }
    } LIMIT 1
  `);

  if (result.results.bindings.length) {
    return result.results.bindings[0].subsidyMeasureConsumption.value;
  } else {
    return null;
  }
}

/**
 * Returns the active form having the given status if exists
 *
 * [CONSIDERED AUTH. SAFE]
 *
 * @param string Uri of the subsidy measure consumption
 * @param string Uri of the required status
 *
 * @returns {Promise<string>}
 */
export async function activeFormHasStatus(subsidyMeasureConsumption, status) {
  const result = await query(`
    PREFIX common: <http://www.w3.org/2007/uwa/context/common.owl#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX adms: <http://www.w3.org/ns/adms#>

    SELECT ?applicationForm
    WHERE {
      GRAPH ?g {
        ?subsidyMeasureConsumption common:active ?step .
        ?applicationForm dct:isPartOf ?step ;
          adms:status ${sparqlEscapeUri(status)} .
      }
    } LIMIT 1
  `);

  if (result.results.bindings.length) {
    return true;
  } else {
    return false;
  }
}

/**
 * Returns the current step of a subsidy measure consumption
 *
 * [CONSIDERED AUTH. SAFE]
 *
 * @param string Uri of the subsidy measure consumption
 *
 * @returns {Promise<string>}
 */
export async function getCurrentStep(subsidyMeasureConsumption) {
  const result = await query(`
    PREFIX common: <http://www.w3.org/2007/uwa/context/common.owl#>

    SELECT ?activeStep
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(subsidyMeasureConsumption)} common:active ?activeStep .
      }
    }
  `);

  if (result.results.bindings.length) {
    return result.results.bindings[0].activeStep.value;
  } else {
    return null;
  }
}

/**
 * Returns the next step linked to a given step
 *
 * [CONSIDERED AUTH. SAFE]
 *
 * @param string Uri of the given step
 *
 * @returns {Promise<string>}
 */
export async function getNextStep(currentStep) {
  const result = await query(`
    PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>

    SELECT ?nextStep
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(currentStep)} xkos:next ?nextStep .
      }
    }
  `);

  if (result.results.bindings.length) {
    return result.results.bindings[0].nextStep.value;
  } else {
    return null;
  }
}

/**
 * Updates the active step of a subsidy measure consumption.
 * If no active step is given or if it is null, we don't set it.
 *
 * @param string Uri of the subsidy measure consumption
 * @param string Uri of the active step
 *
 * @returns {Promise<void>}
 */
export async function updateActiveStep(subsidyMeasureConsumption, activeStep=null) {
  let query = `
    PREFIX common: <http://www.w3.org/2007/uwa/context/common.owl#>

    DELETE {
      GRAPH ?g {
        ${sparqlEscapeUri(subsidyMeasureConsumption)} common:active ?currentStep .
      }
    }
  `;

  if (activeStep) {
    query += `
      INSERT {
        GRAPH ?g {
          ${sparqlEscapeUri(subsidyMeasureConsumption)} common:active ${sparqlEscapeUri(activeStep)} .
        }
      }
    `;
  }

  query += `
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(subsidyMeasureConsumption)} common:active ?currentStep .
      }
    }`;

  await update(query);
}

/**
 * Generates a notification for the change of steps of a subsidy measure consumption.
 * If no current step is given or if it is null, we don't set it.
 *
 * @param string Uri of the subsidy measure consumption
 * @param string Uri of the previous step
 * @param string Uri of the current step
 *
 * @returns {Promise<void>}
 */
export async function generateNotification(subsidyMeasureConsumption, previousStep, currentStep=null) {
  const notificationUuid = uuidv4();
  const notificationUri = `${NOTIFICATION_BASE_URL}${notificationUuid}`;

  let query = `
    PREFIX solid: <http://www.w3.org/ns/solid/terms#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX lblodSubsidie: <http://lblod.data.gift/vocabularies/subsidie/>
    PREFIX adms: <http://www.w3.org/ns/adms#>

    INSERT DATA {
      GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
        ${sparqlEscapeUri(notificationUri)} a solid:Notication ;
          mu:uuid ${sparqlEscapeString(notificationUuid)} ;
          dct:source ${sparqlEscapeUri(subsidyMeasureConsumption)} ;
          lblodSubsidie:previousStep ${sparqlEscapeUri(previousStep)} ;
  `;

  if (currentStep) {
    query += `
          lblodSubsidie:currentStep ${sparqlEscapeUri(currentStep)} ;
    `;
  }

  query += `
        adms:status ${sparqlEscapeUri(NOTIFICATION_OPEN_STATUS)} .
      }
    }`;

  await update(query);
}
