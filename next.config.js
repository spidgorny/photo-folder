// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["spidgorny-react-helpers"],
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

module.exports = nextConfig;
