const { withProjectBuildGradle } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to fix JitPack timeout issues by excluding standard groups from JitPack.
 * This prevents Gradle from attempting to search JitPack for standard dependencies
 * that are already available on Maven Central or Google's repository, which often times out.
 */
const withJitPackFixed = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = fixJitPack(config.modResults.contents);
    }
    return config;
  });
};

function fixJitPack(buildGradle) {
  // Look for the jitpack repository definition
  const jitpackRegex = /maven\s*\{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*\}/g;
  
  // Replace it with a version that excludes standard groups
  const replacement = `maven {
            url 'https://www.jitpack.io'
            content {
                excludeGroup "org.bouncycastle"
                excludeGroup "com.google.android.gms"
                excludeGroup "com.google.firebase"
                excludeGroup "com.facebook.react"
            }
        }`;

  if (buildGradle.includes("https://www.jitpack.io")) {
    return buildGradle.replace(jitpackRegex, replacement);
  }
  
  return buildGradle;
}

module.exports = withJitPackFixed;
