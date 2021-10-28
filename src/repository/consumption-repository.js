import { sparqlEscapeUri as URI, sparqlEscapeString } from 'mu';
import Consumption from '../model/consumption';
import { parseResultToClazz } from '../util/sparql-util';
import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';

class ConsumptionRepository {

  /**
   * Tries to complete an {@link Consumption} for the given {@link Consumption.id}
   *
   * @param id ID of the {@link Consumption} to be found
   * @returns {Promise<Consumption | null>}
   */
  static findByID = async function(id) {
    if (!id)
      throw 'id can not be falsy!';
    const result = parseResultToClazz(await querySudo(`
     PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
     PREFIX subsidie: <http://data.vlaanderen.be/ns/subsidie#>
     PREFIX cpsv: <http://purl.org/vocab/cpsv#>
     PREFIX owl: <http://www.w3.org/2007/uwa/context/common.owl#>
     PREFIX adms: <http://www.w3.org/ns/adms#>
     
     SELECT ?uri ?id ?status ?follows ?active 
     WHERE {
        VALUES ?id { ${sparqlEscapeString(id)} }
        ?uri a subsidie:SubsidiemaatregelConsumptie ;
            mu:uuid ?id ;
            adms:status ?status ;
            cpsv:follows ?follows .
        OPTIONAL { ?uri owl:active ?active .}
     }
    `.trim()), Consumption);

    if (!result)
      return result;
    if (result.length > 1)
      throw `multiple results exists while doing lookup on ID [${id}], data corrupt?`;
    return result;
  };

  /**
   * Updates an {@link Consumption}
   *
   * NOTE: for now only the field(s): status, active
   *
   * @param consumption The updated {@link Consumption} to save.
   * @returns {Promise<Consumption>}
   */
  static update = async function(consumption) {
    const {uri, status, active} = consumption;
    await updateSudo(`
     PREFIX subsidie: <http://data.vlaanderen.be/ns/subsidie#>
     PREFIX cpsv: <http://purl.org/vocab/cpsv#>
     PREFIX owl: <http://www.w3.org/2007/uwa/context/common.owl#>
     PREFIX adms: <http://www.w3.org/ns/adms#>
     DELETE {
        GRAPH ?g {
            ${URI(uri)} adms:status ?status .
            ${active ? `${URI(uri)} owl:active ?active .` : ''}
        }
     } INSERT {
        GRAPH ?g {
            ${URI(uri)} adms:status ${URI(status)} .
            ${active ? `${URI(uri)} owl:active ${URI(active)} .` : ''}
        }
     } WHERE {
        GRAPH ?g {
            ${URI(uri)} a subsidie:SubsidiemaatregelConsumptie .
            ${URI(uri)} adms:status ?status .
            ${active ? `OPTIONAL { ${URI(uri)} owl:active ?active . }` : ''}
        }
     }
    `.trim());
    return consumption;
  };
}

export default ConsumptionRepository;