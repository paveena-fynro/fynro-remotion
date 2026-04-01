import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setCodec("vp8"); // VP8 = WebM with alpha (transparency)
Config.setPixelFormat("yuva420p"); // yuva = with alpha channel
Config.setOutputLocation("out");
