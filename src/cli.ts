#!/usr/bin/env node

import path from "path";
import fs from "fs";
import minimist from "minimist";

function main() {
  const args = minimist(process.argv.slice(2), {
    alias: {
      "template": "t",
    },
  });
  const templateName  = args.template;
  const title = args._[0];
  if (!templateName || !title) {
    console.log(`Usage: random-txt --template=<template name> <title>
  -t, --template: Name of template. Aravialable values: "blog-entories"`);
    process.exit(1);
  }

  const templatePath = path.resolve(__dirname, "../templates/" + templateName + ".json");
  if (!fs.existsSync(templatePath)) {
    console.error(`template "${templateName}" does not exist in templates dir`);
    process.exit(1);
  }
  const templates = JSON.parse(fs.readFileSync(templatePath, "utf-8")) as string[];
  const idx = ~~(templates.length * Math.random());
  const output = templates[idx].replace('%TITLE%', title);
  console.log(output);
}

main();
