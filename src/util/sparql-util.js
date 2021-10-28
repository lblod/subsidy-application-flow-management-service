/**
 * Will take a SPARQL query-result and map the bindings to the given Class.
 *
 * @param result
 * @param clazz
 *
 * @returns [Class] | Class | null
 */
export const parseResultToClazz = ({head, results}, clazz) => {
  if (!head)
    throw 'virtuoso result did not contain a head, cannot map.';
  if (!head.vars || head.vars.length === 0)
    throw 'virtuoso result did not contain any vars, cannot map.';

  if (!results || !results.bindings || results.bindings.length === 0)
    return null;

  let result = results.bindings.map(row => {
    const obj = {};
    head.vars.forEach(key => {
      if(row[key] && row[key].datatype === 'http://www.w3.org/2001/XMLSchema#integer' && row[key].value){
        obj[key] = parseInt(row[key].value);
      }
      else if(row[key] && row[key].datatype === 'http://www.w3.org/2001/XMLSchema#dateTime' && row[key].value){
        obj[key] = new Date(row[key].value);
      }
      else obj[key] = row[key] ? row[key].value:undefined;
    });
    return new clazz(obj);
  });

  if (result.length === 1)
    return result[0];
  return result;
};