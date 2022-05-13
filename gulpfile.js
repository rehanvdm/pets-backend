const gulp = require('gulp');
const fs = require('fs');
const os = require('os');
const path  = require('path');
const spawn = require('child_process').spawn;

const tsj = require("ts-json-schema-generator");
const esbuild = require("esbuild");

const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const standaloneCode = require("ajv/dist/standalone");
const { generateApi } = require('swagger-typescript-api');
const semver = require('semver');
const yaml = require('js-yaml');

function preferLocalPackages(npmBinPath)
{
  if(process.platform === "win32")
    process.env.PATH = process.env.PATH + npmBinPath + ";";
  else
    process.env.PATH = process.env.PATH + ":" + npmBinPath;
}

const apiBasePath = "/src/lambda/api/openapi";
const apiTypesFilename = "types.ts";
const paths = {
  localPackages: path.resolve(__dirname + "/node_modules/.bin"),

  workingDir: path.resolve(__dirname),

  openApiSpec: path.resolve(__dirname + apiBasePath + "/openapi.yaml"),
  openApiTypesBase: path.resolve(__dirname + apiBasePath + "/validation/"),
  openApiTypes: path.resolve(__dirname + apiBasePath + "/validation/" + apiTypesFilename),
  openApiTypesJsonSchema: path.resolve(__dirname + apiBasePath + "/validation/schema"),
  openApiValidationFile: path.resolve(__dirname + apiBasePath + "/validation/index.js"),

  apiSdkTemplate: path.resolve(__dirname + "/api-sdk-template"),
  apiSdk: path.resolve(__dirname + "/api-sdk"),
  apiSdkSrc: path.resolve(__dirname + "/api-sdk/src"),
  apiSdkDist: path.resolve(__dirname + "/api-sdk/dist"),
};
preferLocalPackages(paths.localPackages);
const config = {
  profileName: "<YOUR AWS PROFILE NAME TO USE FOR DEPLOYMENTS>",
  region: "<AWS REGION TO DEPLOY IN>",
  account: "<AWS ACCOUNT ID TO DEPLOY IN>",
  apiSdkRepo: "<HTTPS URL OF THE EXISTING EMPTY GITHUB REPO TO STORE THE API SDK ENDING IN .git>", //example "https://github.com/rehanvdm/pets-api.git"
  apiSdkTemplateReplacements: {
    package: {
      name: "<SDK PACKAGE NAME AS IN THE package.json>", //must start with @, example @rehanvdm/pets-api
      repository: "<SDK PACKAGE REPO AS IN THE package.json>", //example git://github.com/rehanvdm/pets-api.git
    }
  }
};


/**
 * Runs a command, returns the stdout on a successful exit code(0)
 * @param command The executable name
 * @param args The args as a string
 * @param cwd Current Working Directory
 * @param echo Pipes the command standard streams directly to this process to get the output as it is happening,
 *             not waiting for the exit code. Also shows the command that was run
 * @param prefixOutputs Useful if running multiple commands in parallel
 * @param extraEnv Extra variables to pass as Environment variables
 * @return {Promise<string>}
 */
async function execCommand(command, args, cwd = __dirname, echo = true, prefixOutputs = "", extraEnv = {})
{
  return new Promise((resolve, reject) =>
  {
    let allData = "";
    let errOutput = "";
    if(echo)
      console.log(">", command, args);

    const call = spawn(command, [args], {shell: true, windowsVerbatimArguments: true, cwd: cwd, env: {...process.env, ...extraEnv} });

    call.stdout.on('data', function (data)
    {
      allData += data.toString();
      echo && process.stdout.write(prefixOutputs + data.toString());
    });
    call.stderr.on('data', function (data)
    {
      errOutput += data.toString();
      echo && process.stdout.write(prefixOutputs + data.toString());
    });
    call.on('exit', function (code)
    {
      if (code == 0)
        resolve(allData);
      else
        reject({command, args, stdout: allData, stderr: errOutput});
    });
  });
}

function clearDir(destDir)
{
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, {recursive: true});
}

function typeScriptToJsonSchema(openApiTypesPath, destDir)
{
  const config = {
    path: openApiTypesPath,
    type: "*",
    additionalProperties: true
  };

  let schemas = [];
  console.time("* TS TO JSONSCHEMA");
  let schemaRaw = tsj.createGenerator(config).createSchema(config.type);
  console.timeEnd("* TS TO JSONSCHEMA");

  /* Remove all `#/definitions/` so that we can use the Type name as the $id and have matching $refs with the other Types */
  let schema = JSON.parse(JSON.stringify(schemaRaw).replace(/#\/definitions\//gm, ""));

  /* Save each Type jsonschema individually, use the Type name as $id */
  for(let [id, definition] of Object.entries(schema.definitions))
  {
    let cleanId = id.replace(/\./g, "_");
    let singleTypeDefinition = {
      /* Can not have `.` in the id field, replace with `_` so: Pets.GetPets.RequestParams => Pets_GetPets_RequestParams */
      "$id": cleanId,
      "$schema": "http://json-schema.org/draft-07/schema#",
      ...definition,
    };
    schemas.push(singleTypeDefinition);
    fs.writeFileSync(path.resolve(destDir+"/"+cleanId+".json"), JSON.stringify(singleTypeDefinition, null, 2));
  }

  return schemas;
}
function compileAjvStandalone(schemas, validationFile)
{
  console.time("* AJV COMPILE");
  const ajv = new Ajv({schemas: schemas, code: {source: true, esm: true}});
  addFormats(ajv);
  let moduleCode = standaloneCode(ajv);
  console.timeEnd("* AJV COMPILE");
  fs.writeFileSync(validationFile, moduleCode);
}
function esBuildCommonToEsm(validationFile)
{
  console.time("* ES BUILD VALIDATION");
  esbuild.buildSync({
    // minify: true,
    bundle: true,
    target: ["node14"],
    keepNames: true,
    platform: 'node',
    format: "esm",
    entryPoints: [validationFile],
    outfile: validationFile,
    allowOverwrite: true
  });
  console.timeEnd("* ES BUILD VALIDATION");
}
async function esBuildLambda(srcDir, distDir, fileNameNoExtension)
{
  let pathTs =  path.join(__dirname, srcDir, fileNameNoExtension +".ts");
  let pathJs =  path.join(__dirname, distDir, fileNameNoExtension +".js");

  console.time("* ES BUILD LAMBDA");
  await esbuild.build({
    // minify: true, //saves about 10% // But loose accurate break points
    logLevel: "error",
    bundle: true,
    target: ["node14"],
    keepNames: false,
    entryPoints: [pathTs],
    platform: 'node',
    sourcemap: 'inline',
    outfile: pathJs,
  });
  console.timeEnd("* ES BUILD LAMBDA");
}
async function generateTypings(validationFile, validationFileFolder)
{
  console.time("* TSC DECLARATIONS");
  await execCommand("tsc","-allowJs --declaration --emitDeclarationOnly \""+validationFile+"\" --outDir \""+validationFileFolder+"\"",
    path.join(__dirname, "./node_modules/.bin/"));
  console.timeEnd("* TSC DECLARATIONS");
}
async function generateApiSchemaTs(openApiPath, outputPath, outputFileName)
{
  console.time("* GENERATE API TYPES");
  await generateApi({
    name:outputFileName,
    output: outputPath,
    input: openApiPath,
    silent: true,
    generateClient: false,
    generateRouteTypes: true,
    generateResponses: true,
    extractRequestParams: true,
    extractRequestBody: true,
    moduleNameFirstTag: true,
  });
  console.timeEnd("* GENERATE API TYPES");
}
async function buildApiTypes()
{
  /* Clear the output dir for the AJV validation code, definition and JSON Schema definitions */
  clearDir(paths.openApiTypesJsonSchema);

  await generateApiSchemaTs(paths.openApiSpec, paths.openApiTypesBase, apiTypesFilename);

  /* Create the JSON Schema files from the TS Types and save them as individual JSON Schema files */
  let schemas = typeScriptToJsonSchema(paths.openApiTypes, paths.openApiTypesJsonSchema);

  /* Create the AJV validation code in ESM format from the JSON Schema files */
  compileAjvStandalone(schemas, paths.openApiValidationFile);

  /* Bundle the AJV validation code file in ESM format */
  esBuildCommonToEsm(paths.openApiValidationFile);

  /* Create TypeScript typings for the generated AJV validation code */
  await generateTypings(paths.openApiValidationFile, paths.openApiTypesBase);
}
async function buildLambdas()
{
  await esBuildLambda("/src/lambda/api", "/dist/lambda/api", "index");
}
gulp.task('build_lambdas', async () =>
{
  await buildLambdas();
});
gulp.task('build_types', async () =>
{
  await buildApiTypes();
});
gulp.task('watch_types', async () =>
{
  await buildApiTypes();
  gulp.watch(['src/lambda/api/openapi/openapi.yaml'], async function(cb)
  {
    await buildApiTypes();
    cb();
  });
});


async function generateApiSdk()
{
  /* Clear the Source dir and generate the TS file */
  console.log("* Generating API SDK");
  fs.rmSync(paths.apiSdkSrc, {force: true, recursive: true});
  await generateApi({
    name: "index.ts",
    output: paths.apiSdkSrc,
    input: paths.openApiSpec,
  });

  /* Check if the API SDK folder is empty, we need to create files for the first run, copy from api-sdk-template */
  let existingApiPackageJsonPath = paths.apiSdk+"/package.json";
  if(!fs.existsSync(existingApiPackageJsonPath))
  {
    console.log("api-sdk is empty, copying from api-sdk-template");
    fs.copyFileSync(paths.apiSdkTemplate+"/.gitignore", paths.apiSdk+"/.gitignore");
    fs.copyFileSync(paths.apiSdkTemplate+"/package.json", paths.apiSdk+"/package.json");
    fs.copyFileSync(paths.apiSdkTemplate+"/tsconfig.json", paths.apiSdk+"/tsconfig.json");

    /* Give the package a name and fill in the repo field */
    let packageJson = JSON.parse(fs.readFileSync(existingApiPackageJsonPath).toString());
    packageJson.name = config.apiSdkTemplateReplacements.package.name;
    packageJson.repository = config.apiSdkTemplateReplacements.package.repository;
    fs.writeFileSync(existingApiPackageJsonPath, JSON.stringify(packageJson,null,2));
  }

  /* ================================================================================================================ */
  /* Only if the backend project OpenAPI spec version is different from the current published API project SDK version */
  let packageJson = JSON.parse(fs.readFileSync(existingApiPackageJsonPath).toString());
  console.log("Current SDK version:", packageJson.version);

  let openApiSchema = yaml.load(fs.readFileSync(paths.openApiSpec).toString());
  if(!semver.valid(openApiSchema.info.version))
    throw new Error("OpenAPI spec version does not follow semantic versioning");
  else if(semver.eq(packageJson.version, openApiSchema.info.version)) {
    console.log("OpenAPI spec version is the same as the published SDK version, no need to publish");
    return false;
  }
  else if(semver.lt(openApiSchema.info.version, packageJson.version))
    throw new Error("OpenAPI spec version can not be less than the current published SDK version");

  console.log("OpenAPI version:", openApiSchema.info.version);

  /* Set API SDK version same as OpenAPI spec version */
  console.log("* Updating package version from", packageJson.version, "to", openApiSchema.info.version)
  packageJson.version = openApiSchema.info.version;
  fs.writeFileSync(paths.apiSdk+"/package.json", JSON.stringify(packageJson,null,2));
  /* ================================================================================================================ */

  /* Convert TSC to JS using /api-sdk/tsconfig.json which is this https://github.com/acacode/swagger-typescript-api/issues/81 */
  console.log("* TSC API SDK");
  fs.rmSync(paths.apiSdkDist, {force: true, recursive: true});
  await execCommand("tsc", "", paths.apiSdkSrc);

  /* Copy OpenAPI spec file into /dist to just have alongside SDK */
  fs.copyFileSync(paths.openApiSpec, paths.apiSdkDist+"/schema.yaml");
  /* Copy over package.json into /dist because we will do the publishing from within that /dist dir */
  fs.copyFileSync(paths.apiSdk+"/package.json", paths.apiSdkDist+"/package.json");
  /* Need the .npmrc in that /dist dir to publish with those credentials */
  if(fs.existsSync(paths.workingDir+"/.npmrc"))
    fs.copyFileSync(paths.workingDir+"/.npmrc", paths.apiSdkDist+"/.npmrc");
}
async function generateAndPushApiSdk()
{
  fs.rmSync(paths.apiSdk+"/.git", {force: true, recursive: true});
  if(!fs.existsSync(paths.apiSdk))
    fs.mkdirSync(paths.apiSdk,{ recursive: true });

  await execCommand("git", "init", paths.apiSdk);
  await execCommand("git", "remote add origin " + config.apiSdkRepo, paths.apiSdk);

  /* Fails if the repo is empty or if you don't have permissions, assuming empty and that you have permission */
  try
  {
    await execCommand("git", "fetch --all", paths.apiSdk);
    await execCommand("git", "reset --hard origin/master", paths.apiSdk);
  }
  catch (err) {
    console.warn("Repository not found/empty OR you don't have permission.");
    console.log("Assuming you have permission - creating an empty branch..");
    try {
      await execCommand("git", "checkout --orphan master", paths.apiSdk);
      await execCommand("git", "commit --allow-empty -m \"Empty branch\"", paths.apiSdk);
      await execCommand("git", "push -u origin master", paths.apiSdk);
    }
    catch (err) {
      console.log("Creating an empty branch failed");
      console.log("If this is the first run and the repo is completely empty, create an empty branch by running:");
      console.log("cd api-sdk");
      console.log("git checkout --orphan master");
      console.log("git commit --allow-empty -m \"Empty branch\"");
      console.log("git push -u origin master");
      return;
    }
  }

  let resp = await generateApiSdk();
  if(resp === false) //No need to publish, version is the same or less
    return;

  let newPackageJson = JSON.parse(fs.readFileSync(paths.apiSdk+"/package.json").toString());
  let commitMessage = "v" + newPackageJson.version;
  console.log("New SDK version" + newPackageJson.version);

  /* Commit changed files and publish the NPM package to GitHub */
  await execCommand("git", "add .", paths.apiSdk);
  await execCommand("git", "commit -m \"" + commitMessage+"\"", paths.apiSdk);
  await execCommand("git", "push origin master", paths.apiSdk);
  await execCommand("npm", "publish", paths.apiSdkDist);

  return true;
}
gulp.task('generate_and_push_api_sdk', async () =>
{
  /* We should only publish a new version of the API on dev branch */

  try
  {
    await generateAndPushApiSdk(config);
  }
  catch (e) {
    console.error(e);
    throw e;
  }
});


async function cdkCommand(command)
{
  let extraArgs = "";

  if(command.startsWith("deploy"))
    extraArgs = "--require-approval=never";

  let args = [
    command,
    "\"*\"",
    "--profile " + config.profileName,
    "-c region=" + config.region,
    "-c account=" + config.account,
    extraArgs
  ].join(" ");

  await execCommand("cdk", args, paths.workingDir);
}
gulp.task('cdk_bootstrap', async () =>
{
  try
  {
    await buildApiTypes();
    await buildLambdas();
    await execCommand("tsc", "", paths.workingDir);
    await execCommand("cdk", "bootstrap --profile " + config.profileName + " " + config.account + "/" + config.region, paths.workingDir);
  }
  catch (e) {
    console.error(e);
    throw e;
  }
});
gulp.task('cdk_diff', async () =>
{
  try
  {
    await buildApiTypes();
    await buildLambdas();
    await execCommand("tsc", "", paths.workingDir);
    await cdkCommand("diff");
  }
  catch (e) {
    console.error(e);
    throw e;
  }
});
gulp.task('cdk_hotswap', async () =>
{
  try
  {
    await buildApiTypes();
    await buildLambdas();
    await execCommand("tsc", "", paths.workingDir);
    await cdkCommand("deploy --hotswap");
  }
  catch (e) {
    console.error(e);
    throw e;
  }
});
gulp.task('cdk_deploy', async () =>
{
  try
  {
    await buildApiTypes();
    await buildLambdas();
    await execCommand("tsc", "", paths.workingDir);
    await cdkCommand("deploy");

    await generateAndPushApiSdk();
  }
  catch (e) {
    console.error(e);
    throw e;
  }
});


module.exports = {
  esBuildLambda
}
