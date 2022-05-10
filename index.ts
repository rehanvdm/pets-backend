import * as cdk from 'aws-cdk-lib';
import Backend from "./stacks/backend";

const app = new cdk.App();
async function Main()
{
  cdk.Tags.of(app).add("blog", "pets-backend");

  let env = {
    region: app.node.tryGetContext("region"),
    account: app.node.tryGetContext("account")
  };
  console.log("CDK ENV", env);

  const backend = new Backend( app, "pets-backend", { env, });

  app.synth();
}

Main().catch(err => {
  console.error(err);
  process.exit(1);
})
