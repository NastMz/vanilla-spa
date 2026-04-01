import { register } from "node:module";

register("./css-loader.mjs", new URL("./", import.meta.url));
