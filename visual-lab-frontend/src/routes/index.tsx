import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import HomeTemplate from "../components/templates/HomeTemplates";
import { SketchProvider } from "../context/sketchContext";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <SketchProvider>
      <HomeTemplate />
    </SketchProvider>
  );
}
