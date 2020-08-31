*******
Koyeb
*******

Koyeb provides developers a simple way to build and deploy event-driven serverless applications. Combine Docker containers, code, and ready-to-use apps to implement your processing Stack with flexibility and freedom of choice.
Forget the heavy-duty of building resilient infrastructure and combine advanced operation pipelines on your data. Zero server maintenance. More information on the [Koyeb website](https://www.koyeb.com/).

# About this repository

This repository contains the source code of a ready-to-use Koyeb catalog function you can deploy and use in your processing Stack.

Koyeb catalog functions allows you to trigger processing actions to analyze, transform, optimize, etc. data in your Stacks with just a few line of configuration.

Each time a change occurs in this repository, the function is packaged into a Docker image, pushed on the Koyeb organization in hub.docker.com, and available in the [Koyeb catalog](https://www.koyeb.com/catalog).

You can then use the function with just a few lines of configuration in your Koyeb serverless processing Stacks.

# Build your own catalog function

The Koyeb catalog is designed to allow developers to publish, maintain, and share their own functions with Koyeb community.

To get started and build catalog functions, please [checkout](https://www.koyeb.com/docs) our get started guide.

# Get Involved

*  Join the [Koyeb community](https://slack.koyeb.com) Slack group, to provide feedback, ask questions, and discuss with other catalog function maintainers.
*  Identify a bug or looking for enhancements? A great way to contribute to Koyeb functions catalog is to send a detailed report when you encounter an issue. We always appreciate a well-written, thorough bug report, and will thank you for it!
*  We are always happy to accept code updates from the community, if you want to improve a function, just open a new pull request with your changes!

# Run this function locally

See [CONTRIBUTING.md](CONTRIBUTING.md) for best practices and instructions on setting up your development environment to work on Koyeb.

## Run the function

At the moment, we use Docker to run a function locally. We plan to improve and package the local development environment soon to provide a better experience.

To run your function locally type:

```
docker run -p 8080:8080 --rm  -e KOYEB_HANDLER=.handler -e KOYEB_HANDLER=hello-world.handler -v $PWD/hello-world:/var/task -ti koyeb/runtime:nodejs12 --debug
```

This command launch a Docker container using the `koyeb/runtime:nodejs12` image (providing a NodeJS version 14 runtime) and listening on the port `8080`.

## Invoke the function

We use [CloudEvents](https://github.com/cloudevents/spec) for describing event data in common formats to provide interoperability across services, platforms, and systems. To invoke the function, you need to pass required HTTP headers to mock the event handled by the function:

- ce-source: A string representing the event source.
- ce-type: A string representing the event type.
- ce-subject: A string representing the event subject.
- ce-specversion: The CloudEvents spec version
- ce-id: A string representing the event ID.

For instance to invoke a function with a basic payload, run the following command:

```
 curl localhost:8080  -H 'content-type: application/json' -H "ce-specversion: 1.0" -H "ce-source: local-invokation" -H "ce-type: dev" -H "ce-subject: local-function-invokation" -H "ce-id: 1" -d '{"body": "Hello World!"}'
```

In the function definition, you receive the body in the event parameters and the event details in context:

```
const handler = async (event, context, callback) => {
    // your code here.
};

module.exports.handler = handler;
```

The callback parameter is optional but recommended. Your handler should use the callback to return either an error (as the first parameter) or a response object.

## Deploy your function to the Koyeb catalog

Each time you push code changes, a Docker image is built and pushed into the Koyeb organization in the hub.docker.com and becomes available in the Koyeb catalog.