/** Viewport-sized hero URLs. Cloudinary originals are transformed in the URL; Unsplash via query params. */

const CLOUDINARY_UPLOAD = "/image/upload/";

export const HERO_SIZES = "100vw";
export const HERO_SRCSET_WIDTHS = [480, 640, 960, 1280, 1920] as const;

function isCloudinaryUrl(url: string) {
  return url.includes("res.cloudinary.com") && url.includes(CLOUDINARY_UPLOAD);
}

function withCloudinaryTransform(url: string, transform: string): string {
  const idx = url.indexOf(CLOUDINARY_UPLOAD);
  if (idx === -1) return url;

  const after = url.slice(idx + CLOUDINARY_UPLOAD.length);
  const versioned = after.match(/^(?:[^/]+\/)?(v\d+\/.+)$/);
  const rest = versioned ? versioned[1] : after;

  return url.slice(0, idx + CLOUDINARY_UPLOAD.length) + transform + "/" + rest;
}

export function heroImageSrc(url: string, width: number): string {
  if (!url) return "";

  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", "80");
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    } catch {
      return url;
    }
  }

  if (isCloudinaryUrl(url)) {
    return withCloudinaryTransform(
      url,
      `f_auto,q_auto:eco,c_fill,g_auto,w_${width}`
    );
  }

  return url;
}

export function heroSrcSet(url: string): string {
  if (!url) return "";
  return HERO_SRCSET_WIDTHS.map((w) => `${heroImageSrc(url, w)} ${w}w`).join(", ");
}

export function heroLqip(url: string): string {
  if (!url) return "";

  if (isCloudinaryUrl(url)) {
    return withCloudinaryTransform(url, "f_auto,q_auto,w_48,e_blur:1000");
  }

  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("w", "48");
      parsed.searchParams.set("q", "20");
      parsed.searchParams.set("auto", "format");
      return parsed.toString();
    } catch {
      return "";
    }
  }

  return "";
}

export function heroDefaultSrc(url: string): string {
  return heroImageSrc(url, 1280);
}
