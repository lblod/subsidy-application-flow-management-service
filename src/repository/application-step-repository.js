import ApplicationStep from '../model/application-step';
import { parseResultToClazz } from '../util/sparql-util';
import { sparqlEscapeUri as URI, sparqlEscapeInt } from 'mu';
import { querySudo } from '@lblod/mu-auth-sudo';

class ApplicationStepRepository {

  /**
   * Tries to find an {@link ApplicationStep} for the given ApplicationFlow URI and {@link ApplicationStep.order}
   *
   * @param flowURI URI of the ApplicationFlow
   * @param order Order of the {@link ApplicationStep
   *
   * @returns {Promise<ApplicationStep | null>}
   */
  static findByFlowAndOrder = async function(flowURI, order) {

    if (!flowURI)
      throw 'flow can not be falsy!';
    if (!order)
      throw 'order can not be falsy!';

    const result = parseResultToClazz(await querySudo(`
     PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
     PREFIX lblodSubsidie: <http://lblod.data.gift/vocabularies/subsidie/>
     PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
     PREFIX cube: <http://purl.org/linked-data/cube#>
     PREFIX dct: <http://purl.org/dc/terms/>
     
     SELECT ?uri ?id ?previous ?order
     WHERE {
        VALUES ?order { ${sparqlEscapeInt(order)} }
        ?uri a lblodSubsidie:ApplicationStep ;
            mu:uuid ?id ;
            cube:order ?order ;
            dct:isPartOf ${URI(flowURI)} .
            
        OPTIONAL { ?uri xkos:previous ?previous . }     
     }
    `.trim()), ApplicationStep);
    if (!result)
      return result;
    if (result.length > 1)
      throw `multiple results exists while doing lookup on flowURI <${flowURI}> and order [${order}]data corrupt?`;
    return result;

  };
}

export default ApplicationStepRepository;