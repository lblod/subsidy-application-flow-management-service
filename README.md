# subsidy-application-flow-management-service

Service that handles the flow related to subsidy measure consumptions in semantic-forms.

## Overview

This microservice manages workflow state transitions for subsidy measure consumptions (`subsidie:SubsidiemaatregelConsumptie`). It is part of the [mu.semte.ch](https://mu.semte.ch) semantic web stack and communicates exclusively via SPARQL against a triplestore (sudo queries). 

When a user completes a step in the subsidy application flow, this service is called to advance the consumption to the next step. It validates the current state, updates the active step pointer, generates an audit notification, and updates the consumption status accordingly.

## Installation

To add the service to your `mu.semte.ch` stack, add the following snippet to `docker-compose.yml`:

```yaml
services:
  subsidy-application-flow-management:
    image: lblod/subsidy-application-flow-management-service:x.x.x
```

### Environment variables

| Name           | Description          | Default                                         |
| -------------- | -------------------- | ----------------------------------------------- |
| `SERVICE_NAME` | Name of the service  | `subsidy-application-flow-management-service`   |

## API

### Health check

> **GET** `/`

Returns a confirmation message that the service is running.

---

### Go to the next step of the flow

> **PATCH** `/flow/next-step/:uuid`

`uuid` is the `mu:uuid` of a `subsidie:SubsidiemaatregelConsumptie`.

#### What happens

1. **Look up the consumption** — the service fetches the consumption resource identified by the given UUID. Returns `404` if not found.
2. **Find the active step** — retrieves the step currently pointed to by `common:active` on the consumption. Returns `200` (no-op) if there is no active step.
3. **Check form submission** — verifies that the application form linked to the active step has `adms:status` set to the SENT concept. Returns `403` if the form has not been submitted yet.
4. **Advance the step** — resolves the next step via `xkos:next` on the current step and updates `common:active` on the consumption to point to it.
5. **Generate a notification** — inserts a `solid:Notification` resource in the public graph recording the previous step (`lblodSubsidie:previousStep`) and the new step (`lblodSubsidie:currentStep`), with status OPEN.
6. **Update consumption status** — sets the consumption's `adms:status` to ACTIVE.
7. **Detect final step** — if the step that was just left is marked as last (`subsidie:Subsidieprocedurestap.type`), it is the last step of the flow and the consumption status is updated to SENT.

#### Response codes

| Code  | Meaning                                                        |
| ----- | -------------------------------------------------------------- |
| `204` | Step advanced successfully                                     |
| `200` | Consumption has no active step; nothing to advance             |
| `403` | Active form has not been submitted yet                         |
| `404` | Consumption with the given UUID not found                      |
| `500` | Unexpected server error                                        |

## Data model

The service reads and writes data across two named graphs:

| Graph                              | Purpose                                         |
| ---------------------------------- | ----------------------------------------------- |
| `http://mu.semte.ch/graphs/public` | Notifications (`solid:Notification`)            |
| `http://mu.semte.ch/application`   | Consumption status and step type configuration  |

Key ontology namespaces used:

| Prefix           | URI                                                  | Used for                               |
| ---------------- | ---------------------------------------------------- | -------------------------------------- |
| `subsidie:`      | `http://data.vlaanderen.be/ns/subsidie#`             | SubsidiemaatregelConsumptie type       |
| `common:`        | `http://www.w3.org/2007/uwa/context/common.owl#`     | Active step pointer                    |
| `xkos:`          | `http://rdf-vocabulary.ddialliance.org/xkos#`        | Step ordering (`xkos:next`)            |
| `adms:`          | `http://www.w3.org/ns/adms#`                         | Resource status                        |
| `dct:`           | `http://purl.org/dc/terms/`                          | `isPartOf` (form → step)               |
| `mu:`            | `http://mu.semte.ch/vocabularies/core/`              | UUID literals                          |
| `solid:`         | `http://www.w3.org/ns/solid/terms#`                  | Notification type                      |
| `lblodSubsidie:` | `http://lblod.data.gift/vocabularies/subsidie/`      | Step references on notifications       |

## Development

For a more detailed look in how to develop a microservice based on
the [mu-javascript-template](https://github.com/mu-semtech/mu-javascript-template), we would recommend
reading "[Developing with the template](https://github.com/mu-semtech/mu-javascript-template#developing-with-the-template)".

### Developing in the `mu.semte.ch` stack

Paste the following snippet in your `docker-compose.override.yml`:

```yaml
subsidy-application-flow-management:
  image: semtech/mu-javascript-template:1.4.0
  environment:
    NODE_ENV: "development"
  volumes:
    - /absolute/path/to/your/sources/:/app/
```

Setting `NODE_ENV: "development"` enables live reloading of source files inside the container.
