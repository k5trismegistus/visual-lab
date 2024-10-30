import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import HomeTemplate from "../components/templates/HomeTemplates";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <HomeTemplate />;
}
