import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri as URI } from 'mu';
import ApplicationForm from '../model/application-form';
import { parseResultToClazz } from '../util/sparql-util';

export class ApplicationFormRepository {

  /**
   * Tries to find all the {@link ApplicationForm}s that are linked with the given {@link Consumption.uri}
   *
   * @param consumptionURI URI of a {@link Consumption}
   * @returns {Promise<Consumption[] | Consumption | null>}
   */
  static findAllByConsumptionURI = async function(consumptionURI) {
    if (!consumptionURI)
      throw 'consumption can not be falsy!';

    return parseResultToClazz(await querySudo(`
     PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
     PREFIX lblodSubsidie: <http://lblod.data.gift/vocabularies/subsidie/>
     PREFIX cube: <http://purl.org/linked-data/cube#>
     PREFIX dct: <http://purl.org/dc/terms/>
     PREFIX adms: <http://www.w3.org/ns/adms#>
     
     SELECT ?uri ?id ?status ?order
     WHERE {
        ?uri a lblodSubsidie:ApplicationForm ;
            mu:uuid ?id ;
            adms:status ?status ;
            dct:isPartOf ?step .
        ?step cube:order ?order .
        ${URI(consumptionURI)} dct:source ?uri .    
     }
    `.trim()), ApplicationForm);
  };

  /**
   * Updates an {@link ApplicationForm}
   *
   * NOTE: for now only the field(s): status
   *
   * @param form The updated {@link ApplicationForm}
   * @returns {Promise<ApplicationForm>} The same as was received
   */
  static update = async function(form) {
    const {uri, status} = form;
    await updateSudo(`
     PREFIX lblodSubsidie: <http://lblod.data.gift/vocabularies/subsidie/>
     PREFIX adms: <http://www.w3.org/ns/adms#>
     
     DELETE {
        GRAPH ?g {
            ${URI(uri)} adms:status ?status .
        }
     } INSERT {
        GRAPH ?g {
            ${URI(uri)} adms:status ${URI(status)} .
        }
     } WHERE {
        GRAPH ?g {
            ${URI(uri)} a lblodSubsidie:ApplicationForm .
            ${URI(uri)} adms:status ?status .
        }
     }
    `.trim());
    return form;
  };
}