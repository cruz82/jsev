// Use console logging in here because we need to load the configuration before the logging module is usable

import { KoaJwtOptions } from "jwks-rsa";
import { Options as JWTOptions } from "koa-jwt";
import { merge } from "lodash";
import { join } from "path";

import { ILoggerOptions } from "../logging";
import { ICorsOptions } from "../middlewares/cors";
import { IServicesOptions } from "../middlewares/services";

interface IJWTOptions extends JWTOptions {
  jwks: KoaJwtOptions;
}

export interface IConfiguration {
  [key: string]: any;
  name: string;
  port: number;
  env?: string;
  logger?: ILoggerOptions;
  cors: ICorsOptions;
  jwt: IJWTOptions;
  services: IServicesOptions;
}

async function importConfiguration(cfgPath: string, cfgFile: string) {
  const path = join(cfgPath, cfgFile);
  try {
    const cfg = await import(path);
    return cfg;
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") {
      throw err;
    }
    console.warn(`Configuration ${cfgFile} not found`); // tslint:disable-line:no-console
  }
}

export async function loadConfiguration(cfgPath: string) {
  const env = process.env.NODE_ENV;
  const defaultCfg = {
    env,
    name: process.env.name || "app",
    port: 8080,
  };

  const cfgs = [await importConfiguration(cfgPath, "config.js")];

  if (env) {
    const envCfgName = `config.${env}.js`;
    cfgs.push(await importConfiguration(cfgPath, envCfgName));
  }

  return merge(
    defaultCfg,
    ...cfgs.filter((x) => x).map((x) => (x.default ? x.default : x)),
  ) as IConfiguration;
}
