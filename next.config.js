const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
};

module.exports = withVanillaExtract(config);
