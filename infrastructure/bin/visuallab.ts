#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VisualLabStack } from "../lib/visuallab-stack";

const app = new cdk.App();

// Get env from parameter
const APP_ENV = (() => {
  switch (process.argv[2]) {
    case "prod":
      return "prod";
    default:
      return "dev";
  }
})();

new VisualLabStack(app, `VisualLabStack-${APP_ENV}`, {
  tags: {
    env: APP_ENV,
  },
});
