# subsidy-application-flow-management-service

Service that handles the flow related to subsidy measure consumptions in semantic-forms.

## Installation

To add the service to your `mu.semte.ch` stack, add the following snippet to docker-compose.yml:

```yaml
services:
  subsidy-application-flow-management:
    image: lblod/subsidy-application-flow-management-service:x.x.x
```

### Environment variables

Provided [environment variables](https://docs.docker.com/compose/environment-variables/) by the service. These can be added in within the docker declaration.

| Name                     | Description                                                          | Default                                                        |
| ------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SERVICE_NAME`           | The name of the service                                             | `subsidy-application-flow-management-service`                       |

## API

### Go to the next step of the flow

> **PATCH** `/flow/next-step/:uuid`

## Development

For a more detailed look in how to develop a microservices based on
the [mu-javascript-template](https://github.com/mu-semtech/mu-javascript-template), we would recommend
reading "[Developing with the template](https://github.com/mu-semtech/mu-javascript-template#developing-with-the-template)"

### Developing in the `mu.semte.ch` stack

Paste the following snip-it in your `docker-compose.override.yml`:

````yaml  
subsidy-application-flow-management:
  image: semtech/mu-javascript-template:1.4.0
  environment:
    NODE_ENV: "development"
  volumes:
    - /absolute/path/to/your/sources/:/app/
````
